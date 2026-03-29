import React from 'react';
import { Play, Loader2, Code2 } from 'lucide-react';
import { useAgentStore } from '../../store/agentStore';

export function ControlBar({ language, setLanguage, onConvert }: { language: string, setLanguage: (l: string) => void, onConvert: () => void }) {
  const { pipelineStatus } = useAgentStore();
  const isRunning = pipelineStatus === 'running';

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Code2 className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="language-select" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Target Language
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isRunning}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-48 p-2.5 disabled:opacity-50 disabled:cursor-not-allowed outline-none transition-colors"
          >
            <option value="python">Python 3.11</option>
            <option value="java">Java 17</option>
            <option value="csharp">C# 12</option>
            <option value="go">Go 1.22</option>
            <option value="javascript">JavaScript (ES2024)</option>
            <option value="typescript">TypeScript 5</option>
          </select>
        </div>
      </div>

      <button
        onClick={onConvert}
        disabled={isRunning}
        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl transition-all duration-200
          ${isRunning 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-95'
          }`}
      >
        {isRunning ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Play className="w-5 h-5 fill-current" />
        )}
        {isRunning ? 'Converting...' : 'Start Conversion'}
      </button>
    </div>
  );
}
