import { create } from 'zustand';
import { DSAReport, SystemDesignReport, PerformanceReport, BusinessLogicReport, TestResult } from '../types/analysis';

interface AnalysisState {
  dsaReport: DSAReport | null;
  sysDesignReport: SystemDesignReport | null;
  performanceReport: PerformanceReport | null;
  bizLogicReport: BusinessLogicReport | null;
  testResults: TestResult | null;
  setReport: (type: keyof Omit<AnalysisState, 'setReport' | 'resetReports'>, report: any) => void;
  resetReports: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  dsaReport: null,
  sysDesignReport: null,
  performanceReport: null,
  bizLogicReport: null,
  testResults: null,
  setReport: (type, report) => set({ [type]: report }),
  resetReports: () => set({
    dsaReport: null,
    sysDesignReport: null,
    performanceReport: null,
    bizLogicReport: null,
    testResults: null,
  }),
}));
