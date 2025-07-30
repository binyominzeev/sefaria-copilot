import React, { useState, useCallback } from 'react';
import { TorahEditor } from './components/TorahEditor';
import { SourcePanel } from './components/SourcePanel';
import { SourceSuggestion } from './types/sefaria';
import { FileText, Save, Download, Settings } from 'lucide-react';

function App() {
  const [sources, setSources] = useState<SourceSuggestion[]>([]);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(true);
  const [documentTitle, setDocumentTitle] = useState('Untitled Article');
  const [showWelcome, setShowWelcome] = useState(true);

  const handleSourcesDetected = useCallback((detectedSources: SourceSuggestion[]) => {
    setSources(detectedSources);
    if (detectedSources.length > 0) {
      setShowWelcome(false);
    }
  }, []);

  const handleInsertSource = useCallback((source: SourceSuggestion) => {
    // Create a custom event to trigger source insertion in the editor
    const event = new CustomEvent('insertSource', { detail: source });
    document.dispatchEvent(event);
  }, []);

  const toggleSourcePanel = () => {
    setIsSourcePanelOpen(!isSourcePanelOpen);
  };

  const handleSave = () => {
    // Implement save functionality
    console.log('Saving document...');
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting document...');
  };

  const handleSettings = () => {
    // Implement settings functionality
    console.log('Opening settings...');
  };

  return (
    <div className="app h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-8 h-8 text-sefaria-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sefaria Copilot</h1>
                <p className="text-sm text-gray-600">Torah Text Editor with AI Source Detection</p>
              </div>
            </div>
            
            <div className="ml-8">
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="text-lg font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-sefaria-500 rounded px-2 py-1"
                placeholder="Document title..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSourcePanel}
              className={`p-2 rounded-lg transition-colors ${
                isSourcePanelOpen
                  ? 'bg-sefaria-100 text-sefaria-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isSourcePanelOpen ? 'Hide Sources' : 'Show Sources'}
            >
              <FileText className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSave}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Save"
            >
              <Save className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleExport}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Export"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSettings}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <TorahEditor
                onSourcesDetected={handleSourcesDetected}
                onInsertSource={handleInsertSource}
                className="h-full"
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="border-t border-gray-200 bg-white px-6 py-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>
                  {sources.length > 0 
                    ? `${sources.length} source${sources.length === 1 ? '' : 's'} detected`
                    : 'No sources detected'
                  }
                </span>
                {sources.length > 0 && (
                  <span className="text-sefaria-600">
                    AI analysis active
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <span>Ready</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Connected to Sefaria</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Source Panel (moved to the right) */}
        {isSourcePanelOpen && (
          <div className="w-80 flex-shrink-0 h-full overflow-y-auto">
            <SourcePanel
              sources={sources}
              onInsertSource={handleInsertSource}
              className="h-full"
            />
          </div>
        )}
      </div>

      {/* Welcome Modal for first-time users */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <FileText className="w-12 h-12 text-sefaria-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Welcome to Sefaria Copilot
              </h2>
              <p className="text-gray-600 mb-6">
                Start writing your Torah article. As you type sources like "Genesis 1:1" or "Berakhot 2a", 
                AI will automatically detect them and show relevant Sefaria sources in the left panel.
              </p>
              
              <div className="bg-torah-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-torah-800 mb-2">Try typing:</h3>
                <ul className="text-sm text-torah-700 space-y-1">
                  <li>• "Genesis 1:1" or "Bereishit 1:1"</li>
                  <li>• "Berakhot 2a" or "Shabbat 31b"</li>
                  <li>• "Mishnah Avot 1:1"</li>
                  <li>• "Rashi on Genesis 1:1"</li>
                </ul>
              </div>
              
                              <button
                  onClick={() => {
                    setShowWelcome(false);
                    // Focus on the editor
                    setTimeout(() => {
                      const editor = document.querySelector('.ProseMirror');
                      if (editor) {
                        (editor as HTMLElement).focus();
                      }
                    }, 100);
                  }}
                  className="w-full bg-sefaria-600 text-white py-2 px-4 rounded-lg hover:bg-sefaria-700 transition-colors"
                >
                  Start Writing
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;