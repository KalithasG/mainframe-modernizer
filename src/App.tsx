/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { InputPanel } from './components/workspace/InputPanel';
import { OutputPanel } from './components/workspace/OutputPanel';
import { ControlBar } from './components/workspace/ControlBar';
import { AgentPipelineVisualizer } from './components/agents/AgentPipelineVisualizer';
import { AnalysisDashboard } from './components/analysis/AnalysisDashboard';
import { runPipeline } from './services/geminiClient';

const DEFAULT_COBOL = `       IDENTIFICATION DIVISION.
       PROGRAM-ID. HELLO-WORLD.
       AUTHOR. MAINFRAME-DEV.
       
       ENVIRONMENT DIVISION.
       
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-GREETING       PIC X(20) VALUE 'HELLO WORLD'.
       01  WS-COUNTER        PIC 9(2) VALUE 1.
       
       PROCEDURE DIVISION.
       MAIN-LOGIC.
           PERFORM DISPLAY-GREETING UNTIL WS-COUNTER > 5.
           STOP RUN.
           
       DISPLAY-GREETING.
           DISPLAY WS-GREETING ' - LOOP ' WS-COUNTER.
           ADD 1 TO WS-COUNTER.`;

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [cobolInput, setCobolInput] = useState(DEFAULT_COBOL);
  const [targetLanguage, setTargetLanguage] = useState('python');
  const [activeView, setActiveView] = useState('convert');

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleConvert = () => {
    runPipeline(cobolInput, targetLanguage);
  };

  return (
    <AppShell toggleColorMode={toggleColorMode} mode={mode} activeView={activeView} setActiveView={setActiveView}>
      {activeView === 'convert' && (
        <div className="flex flex-col gap-6 flex-grow min-h-0">
          <ControlBar 
            language={targetLanguage} 
            setLanguage={setTargetLanguage} 
            onConvert={handleConvert} 
          />
          
          <AgentPipelineVisualizer />
          
          <div className="flex flex-col md:flex-row gap-6 flex-grow min-h-[120vh] md:min-h-[60vh]">
            <div className="flex-1 flex flex-col min-h-[60vh] md:min-h-0">
              <InputPanel value={cobolInput} onChange={setCobolInput} />
            </div>
            <div className="flex-1 flex flex-col min-h-[60vh] md:min-h-0">
              <OutputPanel language={targetLanguage} />
            </div>
          </div>
          
          <div className="mt-6">
            <AnalysisDashboard />
          </div>
        </div>
      )}

      {activeView === 'analyze' && (
        <div className="flex flex-col gap-6 flex-grow">
          <h2 className="text-2xl font-bold text-gray-900">Analysis Reports</h2>
          <AnalysisDashboard />
        </div>
      )}

      {activeView !== 'convert' && activeView !== 'analyze' && (
        <div className="flex flex-col items-center justify-center flex-grow min-h-[50vh] text-center">
          <h2 className="text-3xl font-bold text-gray-900 capitalize mb-4">
            {activeView.replace('-', ' ')}
          </h2>
          <p className="text-lg text-gray-500 max-w-md">
            This feature is currently under development. Check back later!
          </p>
        </div>
      )}
    </AppShell>
  );
}

