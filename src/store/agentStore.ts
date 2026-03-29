import { create } from 'zustand';
import { AgentRole, AgentInfo, AgentStatus, BugReport, PipelineStatus } from '../types/agents';

interface AgentState {
  agents: Record<AgentRole, AgentInfo>;
  bugReports: BugReport[];
  finalCode: string;
  pipelineStatus: PipelineStatus;
  setAgentStatus: (id: AgentRole, status: AgentStatus) => void;
  appendBugReport: (bug: BugReport) => void;
  setFinalCode: (code: string) => void;
  setPipelineStatus: (status: PipelineStatus) => void;
  resetPipeline: () => void;
}

const initialAgents: Record<AgentRole, AgentInfo> = {
  developer:   { id: 'developer',   name: 'Developer Agent',    status: 'idle', score: null },
  dsa:         { id: 'dsa',         name: 'DSA Agent',           status: 'idle', score: null },
  sysdesign:   { id: 'sysdesign',   name: 'System Design Agent', status: 'idle', score: null },
  performance: { id: 'performance', name: 'Performance Agent',   status: 'idle', score: null },
  bizlogic:    { id: 'bizlogic',    name: 'Business Logic Agent',status: 'idle', score: null },
  testrunner:  { id: 'testrunner',  name: 'Test Runner Agent',   status: 'idle', score: null },
  bugreport:   { id: 'bugreport',   name: 'Bug Report Agent',    status: 'idle', score: null },
  fix:         { id: 'fix',         name: 'Fix Agent',           status: 'idle', score: null },
};

export const useAgentStore = create<AgentState>((set) => ({
  agents: initialAgents,
  bugReports: [],
  finalCode: '',
  pipelineStatus: 'idle',
  setAgentStatus: (id, status) =>
    set(s => ({ agents: { ...s.agents, [id]: { ...s.agents[id], status } } })),
  appendBugReport: (bug) =>
    set(s => ({ bugReports: [...s.bugReports, bug] })),
  setFinalCode: (code) => set({ finalCode: code }),
  setPipelineStatus: (status) => set({ pipelineStatus: status }),
  resetPipeline: () => set({ agents: initialAgents, bugReports: [], finalCode: '', pipelineStatus: 'idle' }),
}));
