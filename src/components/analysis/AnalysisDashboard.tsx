import React, { useState } from 'react';
import { useAnalysisStore } from '../../store/analysisStore';
import { useAgentStore } from '../../store/agentStore';
import { 
  Database, 
  LayoutTemplate, 
  Gauge, 
  Briefcase, 
  Bug,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AnalysisDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const { dsaReport, sysDesignReport, performanceReport, bizLogicReport } = useAnalysisStore();
  const { bugReports } = useAgentStore();

  const getScoreColor = (score: number | undefined) => {
    if (score === undefined) return 'bg-gray-100 text-gray-600';
    if (score >= 80) return 'bg-emerald-100 text-emerald-700';
    if (score >= 60) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const tabs = [
    { id: 'dsa', label: 'DSA', icon: Database, report: dsaReport, score: dsaReport?.overall_dsa_score },
    { id: 'sysdesign', label: 'System Design', icon: LayoutTemplate, report: sysDesignReport, score: sysDesignReport?.overall_design_score },
    { id: 'perf', label: 'Performance', icon: Gauge, report: performanceReport, score: performanceReport?.overall_performance_score },
    { id: 'biz', label: 'Business Logic', icon: Briefcase, report: bizLogicReport, score: bizLogicReport?.overall_equivalence_score },
    { id: 'bugs', label: 'Bug Reports', icon: Bug, count: bugReports.length, isError: bugReports.some(b => b.severity === 'CRITICAL') }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Tabs Header */}
      <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar bg-gray-50/50">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === index;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors
                ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
              {tab.label}
              
              {tab.score !== undefined && (
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${getScoreColor(tab.score)}`}>
                  {tab.score}
                </span>
              )}
              
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${tab.isError ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {tab.count}
                </span>
              )}

              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6 overflow-y-auto flex-grow bg-gray-50/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* DSA Tab */}
            {activeTab === 0 && (
              dsaReport ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dsaReport.structures_found?.map((s, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{s.name}</h4>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${s.is_optimal ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {s.is_optimal ? 'Optimal' : 'Suboptimal'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-500"><span className="font-medium text-gray-700">Origin:</span> {s.cobol_origin}</p>
                        <p className="text-gray-600"><span className="font-medium text-gray-700">Implemented as:</span> {s.implemented_as}</p>
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-blue-800 text-xs font-medium uppercase tracking-wider mb-1">Recommendation</p>
                          <p className="text-blue-900">{s.recommended}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyState message="No DSA analysis available yet." icon={Database} />
            )}

            {/* System Design Tab */}
            {activeTab === 1 && (
              sysDesignReport ? (
                <div className="space-y-4">
                  {sysDesignReport.solid_violations?.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">No SOLID violations found. Excellent design!</span>
                    </div>
                  ) : (
                    sysDesignReport.solid_violations?.map((v, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className={`w-4 h-4 ${v.severity === 'HIGH' ? 'text-red-500' : 'text-amber-500'}`} />
                            {v.principle} Violation
                          </h4>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider
                            ${v.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 
                              v.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 
                              'bg-blue-100 text-blue-700'}`}>
                            {v.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 font-mono bg-gray-50 p-2 rounded border border-gray-100 mb-3">
                          {v.location}
                        </p>
                        <p className="text-gray-700 mb-3">{v.description}</p>
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                          <p className="text-emerald-800 text-xs font-medium uppercase tracking-wider mb-1">Suggestion</p>
                          <p className="text-emerald-900 text-sm">{v.suggestion}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : <EmptyState message="No System Design analysis available yet." icon={LayoutTemplate} />
            )}

            {/* Performance Tab */}
            {activeTab === 2 && (
              performanceReport ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {performanceReport.function_analysis?.map((f, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="font-semibold text-gray-900 font-mono mb-3">{f.function_name}</h4>
                      <div className="flex gap-2 mb-4">
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-md text-xs font-medium font-mono">
                          ⏱ O({f.time_complexity})
                        </span>
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-xs font-medium font-mono">
                          💾 O({f.space_complexity})
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2"><span className="font-medium text-gray-700">Origin:</span> {f.cobol_origin}</p>
                      {f.has_nested_loops && (
                        <div className="flex items-center gap-1.5 mt-3 text-amber-600 text-sm font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <AlertTriangle className="w-4 h-4" />
                          Nested loops detected (Depth: {f.loop_depth})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : <EmptyState message="No Performance analysis available yet." icon={Gauge} />
            )}

            {/* Business Logic Tab */}
            {activeTab === 3 && (
              bizLogicReport ? (
                <div className="space-y-3">
                  {bizLogicReport.equivalence_checks?.map((c, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">COBOL</span>
                          <code className="text-sm text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{c.cobol_construct}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Target</span>
                          <code className="text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{c.converted_construct}</code>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start sm:items-end gap-2 min-w-[120px]">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                          ${c.is_equivalent ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {c.is_equivalent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {c.is_equivalent ? 'Equivalent' : 'Mismatch'}
                        </span>
                      </div>
                      
                      {c.issue && (
                        <div className="w-full sm:w-auto mt-2 sm:mt-0 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
                          <span className="font-semibold">Issue:</span> {c.issue}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : <EmptyState message="No Business Logic analysis available yet." icon={Briefcase} />
            )}

            {/* Bugs Tab */}
            {activeTab === 4 && (
              <div className="space-y-4">
                {bugReports.length > 0 ? bugReports.map((bug, i) => (
                  <div key={i} className={`bg-white p-5 rounded-xl border shadow-sm
                    ${bug.severity === 'CRITICAL' ? 'border-red-200' : 
                      bug.severity === 'HIGH' ? 'border-amber-200' : 'border-gray-200'}`}>
                    
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                          ${bug.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                            bug.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 
                            'bg-gray-100 text-gray-700'}`}>
                          {bug.severity}
                        </span>
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {bug.category}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-gray-400">#{bug.bug_id}</span>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{bug.title}</h4>
                    <p className="text-gray-700 mb-4">{bug.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100 font-mono">
                      <Info className="w-4 h-4 text-gray-400" />
                      <span>
                        {bug.location?.function_name || 'Unknown'} 
                        <span className="text-gray-400 mx-2">|</span> 
                        Lines {bug.location?.line_start}-{bug.location?.line_end}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No bugs reported</h3>
                    <p className="text-gray-500 mt-1">The code looks clean and bug-free.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const EmptyState = ({ message, icon: Icon }: { message: string, icon: any }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center h-full">
    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
      <Icon className="w-8 h-8 text-gray-300" />
    </div>
    <p className="text-gray-500 font-medium">{message}</p>
  </div>
);
