export type AgentRole =
  | 'developer'
  | 'dsa'
  | 'sysdesign'
  | 'performance'
  | 'bizlogic'
  | 'testrunner'
  | 'bugreport'
  | 'fix';

export type AgentStatus = 'idle' | 'running' | 'done' | 'failed' | 'waiting';

export type PipelineStatus = 'idle' | 'running' | 'complete' | 'failed';

export interface AgentInfo {
  id: AgentRole;
  name: string;
  status: AgentStatus;
  score: number | null;
}

export type BugCategory =
  | 'DSA_INCORRECT_STRUCTURE'
  | 'DSA_WRONG_ALGORITHM'
  | 'SYSDESIGN_SOLID_VIOLATION'
  | 'SYSDESIGN_HIGH_COUPLING'
  | 'PERF_WRONG_COMPLEXITY'
  | 'PERF_MEMORY_ISSUE'
  | 'BIZLOGIC_SEMANTIC_MISMATCH'
  | 'BIZLOGIC_PRECISION_LOSS'
  | 'BIZLOGIC_BRANCH_MISSING'
  | 'TEST_FAILURE'
  | 'SYNTAX_ERROR'
  | 'RUNTIME_ERROR';

export interface BugReport {
  bug_id: string;
  source_agent: AgentRole;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: BugCategory;
  title: string;
  description: string;
  location: {
    line_start?: number;
    line_end?: number;
    function_name?: string;
    class_name?: string;
  };
  original_cobol_ref?: string;
  evidence: string;
  suggested_fix?: string;
  auto_fixable: boolean;
  reproducing_test?: string;
}

export interface PipelineEvent {
  stage: 'convert' | 'analyze' | 'bug_report' | 'fix' | 'complete';
  agent?: AgentRole;
  status?: AgentStatus;
  code?: string;
  iteration?: number;
  bugs?: BugReport[];
}
