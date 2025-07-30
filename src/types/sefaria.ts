export interface SefariaText {
  ref: string;
  heRef: string;
  text: string[];
  he: string[];
  book: string;
  category: string;
  sections: number[];
  toSections: number[];
  sectionNames: string[];
  addressTypes: string[];
  textDepth: number;
  primary_category: string;
  type: string;
  next?: string;
  prev?: string;
}

export interface SefariaIndex {
  title: string;
  heTitle: string;
  titleVariants: string[];
  heTitleVariants: string[];
  categories: string[];
  primary_category: string;
  enDesc?: string;
  heDesc?: string;
  compDate?: number[];
  compPlace?: string;
  pubDate?: number[];
  pubPlace?: string;
  era?: string;
  authors?: string[];
  translators?: string[];
  length?: number;
  lengths?: number[];
  order?: number[];
  collectiveTitle?: string;
  heCollectiveTitle?: string;
}

export interface SefariaSearchResult {
  ref: string;
  heRef: string;
  text: string;
  version: string;
  lang: string;
  primary_category: string;
  type: string;
  category: string;
}

export interface SourceSuggestion {
  id: string;
  ref: string;
  heRef: string;
  text: string;
  heText: string;
  category: string;
  confidence: number;
  matchedText: string;
  book: string;
  chapter?: string;
  verse?: string;
}

export interface TextAnalysis {
  originalText: string;
  detectedSources: SourceSuggestion[];
  confidence: number;
  position: {
    start: number;
    end: number;
  };
}