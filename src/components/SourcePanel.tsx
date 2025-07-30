import React, { useState, useMemo } from 'react';
import { SourceSuggestion } from '../types/sefaria';
import { BookOpen, Copy, ExternalLink, Star } from 'lucide-react';

interface SourcePanelProps {
  sources: SourceSuggestion[];
  onInsertSource: (source: SourceSuggestion) => void;
  className?: string;
}

export const SourcePanel: React.FC<SourcePanelProps> = ({
  sources,
  onInsertSource,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<SourceSuggestion | null>(null);

  // Group sources by category
  const groupedSources = useMemo(() => {
    const groups: Record<string, SourceSuggestion[]> = {};
    
    sources.forEach(source => {
      const category = source.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(source);
    });

    // Sort sources within each category by confidence
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => b.confidence - a.confidence);
    });

    return groups;
  }, [sources]);

  const categories = Object.keys(groupedSources);
  const displaySources = activeTab === 'all' ? sources : groupedSources[activeTab] || [];

  const handleSourceClick = (source: SourceSuggestion) => {
    setSelectedSource(source);
  };

  const handleInsertSource = (source: SourceSuggestion) => {
    onInsertSource(source);
  };

  const copySourceText = async (source: SourceSuggestion) => {
    try {
      await navigator.clipboard.writeText(`${source.ref}: ${source.text}`);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const openInSefaria = (source: SourceSuggestion) => {
    const url = `https://www.sefaria.org/${encodeURIComponent(source.ref)}`;
    window.open(url, '_blank');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (sources.length === 0) {
    return (
      <div className={`source-panel bg-white border-r border-gray-200 ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sefaria-600" />
            Source Suggestions
          </h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">
            Start typing Torah or Talmud sources in your article to see suggestions here.
          </p>
          <p className="text-xs mt-2 text-gray-400">
            Try: "Genesis 1:1", "Berakhot 2a", or "Mishnah Avot 1:1"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`source-panel bg-white border-r border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sefaria-600" />
          Source Suggestions
          <span className="text-sm font-normal text-gray-500">({sources.length})</span>
        </h2>
      </div>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-sefaria-500 text-sefaria-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All ({sources.length})
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === category
                    ? 'border-sefaria-500 text-sefaria-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {category} ({groupedSources[category]?.length || 0})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Source List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-2">
          {displaySources.map((source) => (
            <div
              key={source.id}
              className={`source-suggestion ${
                selectedSource?.id === source.id ? 'active' : ''
              }`}
              onClick={() => handleSourceClick(source)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {source.ref}
                  </h3>
                  {source.heRef && (
                    <p className="text-sm text-gray-600 hebrew-text mt-1">
                      {source.heRef}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Star
                    className={`w-4 h-4 ${getConfidenceColor(source.confidence)}`}
                    fill="currentColor"
                  />
                  <span className={`text-xs ${getConfidenceColor(source.confidence)}`}>
                    {getConfidenceText(source.confidence)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                {source.text}
              </p>

              {source.heText && source.heText !== source.text && (
                <p className="text-sm text-gray-600 hebrew-text line-clamp-2 mb-3">
                  {source.heText}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {source.category}
                  </span>
                  {source.matchedText && (
                    <span className="text-xs text-gray-500">
                      Matched: "{source.matchedText}"
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copySourceText(source);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy text"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openInSefaria(source);
                    }}
                    className="p-1 text-gray-400 hover:text-sefaria-600 transition-colors"
                    title="Open in Sefaria"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInsertSource(source);
                    }}
                    className="px-2 py-1 text-xs bg-sefaria-600 text-white rounded hover:bg-sefaria-700 transition-colors"
                  >
                    Insert
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Source Detail */}
      {selectedSource && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            {selectedSource.ref}
          </h4>
          <p className="text-sm text-gray-700 mb-3">
            {selectedSource.text}
          </p>
          {selectedSource.heText && selectedSource.heText !== selectedSource.text && (
            <p className="text-sm text-gray-600 hebrew-text mb-3">
              {selectedSource.heText}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Confidence: {Math.round(selectedSource.confidence * 100)}%
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openInSefaria(selectedSource)}
                className="text-xs text-sefaria-600 hover:text-sefaria-700"
              >
                View on Sefaria
              </button>
              <button
                onClick={() => handleInsertSource(selectedSource)}
                className="px-3 py-1 text-xs bg-sefaria-600 text-white rounded hover:bg-sefaria-700 transition-colors"
              >
                Insert Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};