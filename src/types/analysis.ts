export interface DSAReport {
  structures_found: {
    name: string;
    cobol_origin: string;
    implemented_as: string;
    recommended: string;
    is_optimal: boolean;
    issue?: string;
  }[];
  algorithms_found: {
    function_name: string;
    cobol_origin: string;
    algorithm_type: string;
    current_complexity: string;
    optimal_complexity: string;
    is_optimal: boolean;
    improvement_suggestion?: string;
  }[];
  overall_dsa_score: number;
  critical_issues: string[];
}

export interface SystemDesignReport {
  solid_violations: {
    principle: 'SRP' | 'OCP' | 'LSP' | 'ISP' | 'DIP';
    location: string;
    description: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    suggestion: string;
  }[];
  coupling_score: number;
  cohesion_score: number;
  god_classes: {
    class_name: string;
    line_count: number;
    responsibilities: string[];
    split_suggestion: string[];
  }[];
  layer_violations: {
    description: string;
    location: string;
    fix: string;
  }[];
  overall_design_score: number;
  architecture_pattern: string;
  recommended_pattern: string;
}

export interface PerformanceReport {
  function_analysis: {
    function_name: string;
    time_complexity: string;
    space_complexity: string;
    cobol_origin: string;
    has_nested_loops: boolean;
    loop_depth: number;
    issues: string[];
  }[];
  hotspots: {
    function_name: string;
    current_complexity: string;
    impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    optimization: string;
  }[];
  antipatterns: {
    type: 'STRING_CONCAT_LOOP' | 'IO_IN_LOOP' | 'REPEATED_ALLOCATION' | 'UNNECESSARY_SORT';
    location: string;
    description: string;
    fix: string;
  }[];
  overall_performance_score: number;
  estimated_improvement_possible: string;
}

export interface BusinessLogicReport {
  equivalence_checks: {
    cobol_construct: string;
    converted_construct: string;
    is_equivalent: boolean;
    issue?: string;
    fix?: string;
  }[];
  precision_issues: {
    cobol_field: string;
    converted_type: string;
    expected_type: string;
    severity: 'CRITICAL' | 'HIGH';
  }[];
  missing_branches: {
    cobol_condition: string;
    location: string;
    impact: string;
  }[];
  data_loss_risks: string[];
  overall_equivalence_score: number;
  verdict: 'SAFE' | 'REVIEW_REQUIRED' | 'DO_NOT_USE';
}

export interface TestResult {
  test_suite: string;
  language: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage_percent: number;
  duration_ms: number;
  failed_tests: {
    test_name: string;
    error_message: string;
    stack_trace?: string;
    expected?: string;
    actual?: string;
  }[];
  stdout: string;
  stderr: string;
  exit_code: number;
}
