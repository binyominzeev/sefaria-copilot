import axios from 'axios';
import { SefariaText, SefariaSearchResult, SourceSuggestion, TextAnalysis } from '../types/sefaria';

const SEFARIA_API_BASE = 'https://www.sefaria.org/api';

class SefariaApiService {
  private cache = new Map<string, any>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getText(ref: string): Promise<SefariaText | null> {
    const cacheKey = `text:${ref}`;
    const cached = this.getCached<SefariaText>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${SEFARIA_API_BASE}/texts/${encodeURIComponent(ref)}`);
      const data = response.data;
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching text from Sefaria:', error);
      return null;
    }
  }

  async searchTexts(query: string, limit = 10): Promise<SefariaSearchResult[]> {
    const cacheKey = `search:${query}:${limit}`;
    const cached = this.getCached<SefariaSearchResult[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${SEFARIA_API_BASE}/search-wrapper`, {
        params: {
          q: query,
          tab: 'text',
          tvar: 1,
          tsort: 'relevance',
          svar: 1,
          ssort: 'relevance',
          filters: '',
          size: limit
        }
      });

      const results = response.data.text_hits || [];
      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Error searching Sefaria:', error);
      return [];
    }
  }

  private openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

  /**
   * Uses OpenAI to extract or infer possible Jewish text references from any input (even implicit or in Hungarian).
   */
  private async aiDetectReferences(text: string): Promise<string[]> {
    if (!this.openaiApiKey) return [];

    const systemPrompt = `
    You are an expert in Jewish texts and will act as an autocomplete assistant for a Torah article writer.
Your task is to identify potential Torah references (e.g., Biblical verses, Mishnah tractates, Talmud folios, Midrash collections, Zohar, major commentaries, etc.) that the user is *likely trying to complete or is about to type* at the very end of their provided text.

**Crucially, do NOT return references that are already fully present and identifiable within the main body of the text provided.** Focus exclusively on suggestions for the *last few words or the current incomplete thought* at the end of the input.

Your output must be a JSON object with a single key: "references". The value of "references" should be an array of strings, where each string is a suggested Torah reference in its most common and precise format (e.g., "Genesis 1:1", "Shabbat 31a", "Mishnah Brachot 2:3", "Rashi on Genesis 1:1"). Provide up to 5 highly relevant suggestions.

Do not include any additional text, explanations, or formatting. The output must be valid JSON.
    `;

    const userPrompt = text;

    console.log('[Sefaria Copilot] OpenAI system prompt:', systemPrompt);
    console.log('[Sefaria Copilot] OpenAI user prompt:', userPrompt);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini', // or 'gpt-4-turbo'
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 128,
          temperature: 0.8,
          top_p: 1,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Log the full response
      console.log('[Sefaria Copilot] OpenAI response:', response.data);

      const content = response.data.choices[0].message.content;
      // Remove Markdown code fences if present
      const cleaned = content.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1').trim();
      try {
        const refs = JSON.parse(cleaned);
        if (Array.isArray(refs)) return refs;
        if (refs && typeof refs === 'object' && Array.isArray(refs.references)) return refs.references;
        return [];
      } catch (parseError) {
        console.error('[Sefaria Copilot] Failed to parse OpenAI response content:', cleaned, parseError);
        return [];
      }
    } catch (e) {
      console.error('[Sefaria Copilot] AI reference extraction failed:', e);
      return [];
    }
  }

  async getSourceSuggestions(text: string): Promise<SourceSuggestion[]> {
    // 1. Try AI-based detection first
    const aiRefs = await this.aiDetectReferences(text);
    let suggestions: SourceSuggestion[] = [];

    for (const ref of aiRefs) {
      try {
        const sefariaText = await this.getText(ref);
        if (sefariaText) {
          suggestions.push({
            id: `ai-${ref}`,
            ref: sefariaText.ref,
            heRef: sefariaText.heRef,
            text: Array.isArray(sefariaText.text) ? sefariaText.text.join(' ') : sefariaText.text,
            heText: Array.isArray(sefariaText.he) ? sefariaText.he.join(' ') : sefariaText.he,
            category: sefariaText.primary_category,
            confidence: 0.95,
            matchedText: ref,
            book: sefariaText.book
          });
        }
      } catch (e) {
        // fallback: ignore if not found
      }
    }

    // 2. Fallback to regex-based detection if AI found nothing
    if (suggestions.length === 0) {
      suggestions = await this.getSourceSuggestionsRegex(text);
    }

    return suggestions.slice(0, 10);
  }

  /**
   * The original regex-based suggestion logic, renamed for clarity.
   */
  private async getSourceSuggestionsRegex(text: string): Promise<SourceSuggestion[]> {
    // First, try to detect potential references using common patterns
    const potentialRefs = this.detectPotentialReferences(text);
    const suggestions: SourceSuggestion[] = [];

    for (const potentialRef of potentialRefs) {
      try {
        // Try to get the text directly if it looks like a reference
        const sefariaText = await this.getText(potentialRef.ref);
        if (sefariaText) {
          suggestions.push({
            id: `direct-${potentialRef.ref}`,
            ref: sefariaText.ref,
            heRef: sefariaText.heRef,
            text: Array.isArray(sefariaText.text) ? sefariaText.text.join(' ') : sefariaText.text,
            heText: Array.isArray(sefariaText.he) ? sefariaText.he.join(' ') : sefariaText.he,
            category: sefariaText.primary_category,
            confidence: potentialRef.confidence,
            matchedText: potentialRef.matchedText,
            book: sefariaText.book
          });
        }
      } catch (error) {
        // If direct lookup fails, try searching
        const searchResults = await this.searchTexts(potentialRef.matchedText, 3);
        for (const result of searchResults) {
          suggestions.push({
            id: `search-${result.ref}`,
            ref: result.ref,
            heRef: result.heRef,
            text: result.text,
            heText: result.text, // Search results might not have separate Hebrew
            category: result.primary_category,
            confidence: potentialRef.confidence * 0.8, // Lower confidence for search results
            matchedText: potentialRef.matchedText,
            book: result.ref.split(' ')[0]
          });
        }
      }
    }

    // If no direct matches, try a general search
    if (suggestions.length === 0) {
      const searchResults = await this.searchTexts(text, 5);
      for (const result of searchResults) {
        suggestions.push({
          id: `general-${result.ref}`,
          ref: result.ref,
          heRef: result.heRef,
          text: result.text,
          heText: result.text,
          category: result.primary_category,
          confidence: 0.5,
          matchedText: text,
          book: result.ref.split(' ')[0]
        });
      }
    }

    return suggestions.slice(0, 10); // Limit to top 10 suggestions
  }

  private detectPotentialReferences(text: string): Array<{ref: string, confidence: number, matchedText: string}> {
    const potentialRefs: Array<{ref: string, confidence: number, matchedText: string}> = [];
    
    // Common Torah/Talmud reference patterns
    const patterns = [
      // Torah references (e.g., "Genesis 1:1", "Bereishit 1:1")
      {
        regex: /(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Bereishit|Shemot|Vayikra|Bamidbar|Devarim)\s+(\d+):(\d+)/gi,
        confidence: 0.9
      },
      // Talmud references (e.g., "Berakhot 2a", "Shabbat 31b")
      {
        regex: /([A-Za-z]+)\s+(\d+[ab])/gi,
        confidence: 0.8
      },
      // Mishnah references (e.g., "Mishnah Berakhot 1:1")
      {
        regex: /(Mishnah|Mishna)\s+([A-Za-z]+)\s+(\d+):(\d+)/gi,
        confidence: 0.85
      },
      // Rashi, Tosafot, etc.
      {
        regex: /(Rashi|Tosafot|Ramban|Ibn Ezra)\s+on\s+([A-Za-z\s]+\d+:\d+)/gi,
        confidence: 0.7
      },
      // Hebrew book names
      {
        regex: /(ברכות|שבת|עירובין|פסחים|יומא|סוכה|ביצה|ראש השנה|תענית|מגילה|מועד קטן|חגיגה)\s+(\d+[אב])/gi,
        confidence: 0.9
      }
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern.regex);
      for (const match of matches) {
        const matchedText = match[0];
        let ref = matchedText;
        
        // Try to normalize the reference
        ref = this.normalizeReference(ref);
        
        potentialRefs.push({
          ref,
          confidence: pattern.confidence,
          matchedText
        });
      }
    }

    return potentialRefs;
  }

  private normalizeReference(ref: string): string {
    // Basic normalization - convert common English names to Sefaria format
    const bookMappings: Record<string, string> = {
      'Genesis': 'Genesis',
      'Bereishit': 'Genesis',
      'Exodus': 'Exodus',
      'Shemot': 'Exodus',
      'Leviticus': 'Leviticus',
      'Vayikra': 'Leviticus',
      'Numbers': 'Numbers',
      'Bamidbar': 'Numbers',
      'Deuteronomy': 'Deuteronomy',
      'Devarim': 'Deuteronomy'
    };

    let normalized = ref;
    for (const [key, value] of Object.entries(bookMappings)) {
      normalized = normalized.replace(new RegExp(key, 'gi'), value);
    }

    return normalized;
  }

  async analyzeText(text: string): Promise<TextAnalysis[]> {
    const words = text.split(/\s+/);
    const analyses: TextAnalysis[] = [];
    
    // Analyze text in sliding windows to catch multi-word references
    for (let i = 0; i < words.length; i++) {
      for (let windowSize = 1; windowSize <= Math.min(5, words.length - i); windowSize++) {
        const window = words.slice(i, i + windowSize).join(' ');
        const suggestions = await this.getSourceSuggestions(window);
        
        if (suggestions.length > 0 && suggestions[0].confidence > 0.6) {
          const startPos = text.indexOf(window);
          if (startPos !== -1) {
            analyses.push({
              originalText: window,
              detectedSources: suggestions,
              confidence: suggestions[0].confidence,
              position: {
                start: startPos,
                end: startPos + window.length
              }
            });
          }
        }
      }
    }

    // Remove overlapping analyses, keeping the highest confidence ones
    return this.deduplicateAnalyses(analyses);
  }

  private deduplicateAnalyses(analyses: TextAnalysis[]): TextAnalysis[] {
    const sorted = analyses.sort((a, b) => b.confidence - a.confidence);
    const result: TextAnalysis[] = [];

    for (const analysis of sorted) {
      const overlaps = result.some(existing => 
        (analysis.position.start < existing.position.end && 
         analysis.position.end > existing.position.start)
      );
      
      if (!overlaps) {
        result.push(analysis);
      }
    }

    return result.sort((a, b) => a.position.start - b.position.start);
  }
}

export const sefariaApi = new SefariaApiService();