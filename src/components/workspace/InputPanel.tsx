import React, { useRef } from 'react';
import { Upload, Copy, ClipboardPaste, Trash2 } from 'lucide-react';
import Editor from '@monaco-editor/react';

export function InputPanel({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onChange(content);
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-700">COBOL Input</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            disabled={!value}
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
            disabled={!value}
            title="Clear Code"
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload COBOL File"
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
        <input
          type="file"
          accept=".cbl,.cob,.cobol,.txt,text/plain"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
      </div>
      <div className="flex-grow relative">
        <div className="absolute inset-0">
          <Editor
            height="100%"
            defaultLanguage="cobol"
            theme="light"
            value={value}
            onChange={(val) => onChange(val || '')}
            options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
            loading={<div className="p-4 text-gray-500">Loading Editor...</div>}
          />
        </div>
      </div>
    </div>
  );
}
