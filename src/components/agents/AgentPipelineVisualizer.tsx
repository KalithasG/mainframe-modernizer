import React from 'react';
import { useAgentStore } from '../../store/agentStore';
import { AgentRole, AgentStatus } from '../../types/agents';
import { motion } from 'motion/react';
import { 
  Code2, 
  Database, 
  LayoutTemplate, 
  Gauge, 
  Briefcase, 
  TestTube, 
  Bug, 
  RefreshCw,
  CheckCircle2,
  CircleDashed,
  Loader2,
  XCircle,
  Wrench
} from 'lucide-react';

const agentIcons: Record<AgentRole, React.ElementType> = {
  developer: Code2,
  dsa: Database,
  sysdesign: LayoutTemplate,
  performance: Gauge,
  bizlogic: Briefcase,
  testrunner: TestTube,
  bugreport: Bug,
  fix: Wrench,
};

const StatusIcon = ({ status }: { status: AgentStatus }) => {
  switch (status) {
    case 'running':
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    case 'done':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'waiting':
      return <CircleDashed className="w-4 h-4 text-gray-400" />;
    default:
      return <CircleDashed className="w-4 h-4 text-gray-300" />;
  }
};

const AgentCard = ({ 
  role, 
  name, 
  status, 
  isMain = false 
}: { 
  role: AgentRole, 
  name: string, 
  status: AgentStatus,
  isMain?: boolean
}) => {
  const Icon = agentIcons[role];
  
  const getBorderColor = () => {
    switch (status) {
      case 'running': return 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
      case 'done': return 'border-emerald-500/50 bg-emerald-50/50';
      case 'failed': return 'border-red-500/50 bg-red-50/50';
      default: return 'border-gray-200 bg-white';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-500 ${getBorderColor()} ${isMain ? 'w-48' : 'w-44'}`}
    >
      <div className={`p-2 rounded-lg ${status === 'running' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate" title={name}>
          {name.replace(' Agent', '')}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <StatusIcon status={status} />
          <span className="text-xs text-gray-500 capitalize">{status}</span>
        </div>
      </div>
      
      {/* Pulse effect for running state */}
      {status === 'running' && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      )}
    </motion.div>
  );
};

export function AgentPipelineVisualizer() {
  const { agents, pipelineStatus } = useAgentStore();
  const analysisAgents: AgentRole[] = ['dsa', 'sysdesign', 'performance', 'bizlogic', 'testrunner'];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <RefreshCw className={`w-5 h-5 ${pipelineStatus === 'running' ? 'animate-spin text-blue-500' : 'text-gray-400'}`} />
          Agent Pipeline
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status:</span>
          <span className={`text-sm font-semibold capitalize ${
            pipelineStatus === 'running' ? 'text-blue-600' : 
            pipelineStatus === 'complete' ? 'text-emerald-600' : 
            pipelineStatus === 'failed' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {pipelineStatus}
          </span>
        </div>
      </div>

      <div className="relative flex flex-col xl:flex-row items-center justify-between gap-8 xl:gap-6">
        {/* Horizontal Connection Line (Desktop) */}
        <div className="hidden xl:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2">
          {pipelineStatus === 'running' && (
            <motion.div 
              className="h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{ width: '50%' }}
            />
          )}
        </div>

        {/* Vertical Connection Line (Mobile/Tablet) */}
        <div className="xl:hidden absolute left-1/2 top-0 w-0.5 h-full bg-gray-100 -z-10 -translate-x-1/2">
          {pipelineStatus === 'running' && (
            <motion.div 
              className="w-full bg-gradient-to-b from-transparent via-blue-400 to-transparent"
              animate={{ y: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{ height: '50%' }}
            />
          )}
        </div>

        {/* Phase 1: Developer */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 bg-white px-2">Phase 1: Code</span>
          <AgentCard role="developer" name={agents.developer.name} status={agents.developer.status} isMain />
        </div>

        {/* Phase 2: Analysis (Parallel) */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 bg-white px-2">Phase 2: Analysis</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-100">
            {analysisAgents.map(id => (
              <AgentCard key={id} role={id} name={agents[id].name} status={agents[id].status} />
            ))}
          </div>
        </div>

        {/* Phase 3: Review */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 bg-white px-2">Phase 3: Review</span>
          <AgentCard role="bugreport" name={agents.bugreport.name} status={agents.bugreport.status} isMain />
        </div>

        {/* Phase 4: Fix */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 bg-white px-2">Phase 4: Fix</span>
          <AgentCard role="fix" name={agents.fix.name} status={agents.fix.status} isMain />
        </div>
      </div>

      {pipelineStatus === 'running' && (
        <div className="mt-8 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      )}
    </div>
  );
}
