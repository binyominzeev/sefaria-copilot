import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { SourceSuggestion } from '../types/sefaria';
import { sefariaApi } from '../services/sefariaApi';
import { debounce } from '../utils/debounce';

interface TorahEditorProps {
  onSourcesDetected: (sources: SourceSuggestion[]) => void;
  onInsertSource?: (source: SourceSuggestion) => void;
  className?: string;
}

export const TorahEditor: React.FC<TorahEditorProps> = ({ 
  onSourcesDetected, 
  onInsertSource,
  className = '' 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your Torah article... Type sources like "Genesis 1:1" or "Berakhot 2a" to see suggestions.',
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-torah-200 text-torah-900',
        },
      }),
      Typography,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'editor-content prose-torah focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      if (text.trim().length > 10) { // Only analyze if there's substantial text
        debouncedAnalyzeText(text);
      }
    },
  });

  const analyzeText = useCallback(async (text: string) => {
    if (!text || text.length < 3) return;
    
    setIsAnalyzing(true);
    try {
      const suggestions = await sefariaApi.getSourceSuggestions(text);
      onSourcesDetected(suggestions);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onSourcesDetected]);

  const debouncedAnalyzeText = useCallback(
    debounce(analyzeText, 1000),
    [analyzeText]
  );

  const insertSource = useCallback((source: SourceSuggestion) => {
    if (!editor) return;

    const { ref, heRef } = source;
    const sourceText = `[${ref}${heRef ? ` / ${heRef}` : ''}]`;
    
    editor.chain().focus().insertContent(sourceText).run();
  }, [editor]);

  const formatText = useCallback((format: string) => {
    if (!editor) return;

    switch (format) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'highlight':
        editor.chain().focus().toggleHighlight().run();
        break;
      case 'quote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'h1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'h2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'h3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
    }
  }, [editor]);

  useEffect(() => {
    const handleInsertSourceEvent = (event: CustomEvent) => {
      const source = event.detail as SourceSuggestion;
      insertSource(source);
    };

    document.addEventListener('insertSource', handleInsertSourceEvent as EventListener);

    return () => {
      debouncedAnalyzeText.cancel?.();
      document.removeEventListener('insertSource', handleInsertSourceEvent as EventListener);
    };
  }, [debouncedAnalyzeText, insertSource]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={`torah-editor ${className}`}>
      {/* Toolbar */}
      <div className="toolbar flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-1">
          <button
            onClick={() => formatText('bold')}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bold') ? 'bg-torah-200 text-torah-800' : 'text-gray-600'
            }`}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => formatText('italic')}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('italic') ? 'bg-torah-200 text-torah-800' : 'text-gray-600'
            }`}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => formatText('highlight')}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('highlight') ? 'bg-torah-200 text-torah-800' : 'text-gray-600'
            }`}
            title="Highlight"
          >
            ✨
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => formatText('h1')}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-torah-200 text-torah-800' : 'text-gray-600'
            }`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => formatText('h2')}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-torah-200 text-torah-800' : 'text-gray-600'
            }`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => formatText('h3')}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-torah-200 text-torah-800' : 'text-gray-600'
            }`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => formatText('quote')}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('blockquote') ? 'bg-torah-200 text-torah-800' : 'text-gray-600'
            }`}
            title="Quote"
          >
            "
          </button>
        </div>

        <div className="flex-1" />

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-sm text-sefaria-600">
            <div className="animate-spin w-4 h-4 border-2 border-sefaria-600 border-t-transparent rounded-full" />
            Analyzing sources...
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};