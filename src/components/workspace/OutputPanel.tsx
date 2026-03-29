import React from 'react';
import { Download, Copy, ClipboardPaste, Trash2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAgentStore } from '../../store/agentStore';

export function OutputPanel({ language }: { language: string }) {
  const { finalCode, setFinalCode } = useAgentStore();

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'python': return 'python';
      case 'java': return 'java';
      case 'csharp': return 'csharp';
      case 'go': return 'go';
      case 'javascript': return 'javascript';
      case 'typescript': return 'typescript';
      default: return 'plaintext';
    }
  };

  const handleDownload = () => {
    if (!finalCode) return;
    const blob = new Blob([finalCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Determine file extension
    let ext = '.txt';
    switch (language) {
      case 'python': ext = '.py'; break;
      case 'java': ext = '.java'; break;
      case 'csharp': ext = '.cs'; break;
      case 'go': ext = '.go'; break;
      case 'javascript': ext = '.js'; break;
      case 'typescript': ext = '.ts'; break;
    }
    
    a.download = `converted_code${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalCode);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setFinalCode(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleClear = () => {
    setFinalCode('');
  };

  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-700">Converted Output ({language})</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            disabled={!finalCode}
            title="Copy Code"
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handlePaste}
            title="Paste Code"
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ClipboardPaste className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            disabled={!finalCode}
            title="Clear Code"
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button
            onClick={handleDownload}
            disabled={!finalCode}
            title="Download Converted Code"
            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-grow relative">
        <div className="absolute inset-0">
          <Editor
            height="100%"
            language={getMonacoLanguage(language)}
            theme="light"
            value={finalCode}
            onChange={(val) => setFinalCode(val || '')}
            options={{ minimap: { enabled: false }, fontSize: 14, readOnly: false, padding: { top: 16 } }}
            loading={<div className="p-4 text-gray-500">Loading Editor...</div>}
          />
        </div>
      </div>
    </div>
  );
}
