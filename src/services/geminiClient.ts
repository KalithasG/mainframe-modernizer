import { GoogleGenAI, Type } from '@google/genai';
import { useAgentStore } from '../store/agentStore';
import { useAnalysisStore } from '../store/analysisStore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MAX_ITERATIONS = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateContentWithRetry(options: any, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(options);
    } catch (error: any) {
      if (error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('429')) {
        const delay = 15000 * (attempt + 1);
        console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded for Gemini API.');
}

export async function runPipeline(cobolInput: string, targetLanguage: string) {
  const { setAgentStatus, setFinalCode, setPipelineStatus, appendBugReport, resetPipeline } = useAgentStore.getState();
  const { setReport, resetReports } = useAnalysisStore.getState();

  resetPipeline();
  resetReports();
  setPipelineStatus('running');

  try {
    // Stage 1: Convert
    setAgentStatus('developer', 'running');
    
    const convertPrompt = `You are an expert software engineer specializing in COBOL modernization.
Convert this COBOL to ${targetLanguage}.
Return ONLY the converted code. Zero explanations, zero markdown fences.
Semantic equivalence is non-negotiable.

<cobol>
${cobolInput}
</cobol>`;

    const convertResponse = await generateContentWithRetry({
      model: 'gemini-3.1-pro-preview',
      contents: convertPrompt,
      config: { temperature: 0.1 },
    });

    let currentCode = convertResponse.text?.replace(/```[a-z]*\n/g, '').replace(/```/g, '').trim() || '';
    setFinalCode(currentCode);
    setAgentStatus('developer', 'done');

    await sleep(5000); // Prevent rate limits

    for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
      // Stage 2: Sequential analysis to avoid rate limits
      const analysisAgents = ['dsa', 'sysdesign', 'performance', 'bizlogic', 'testrunner'] as const;
      analysisAgents.forEach(a => setAgentStatus(a, 'running'));

      const dsaRaw = await runDSAAnalysis(cobolInput, currentCode, targetLanguage);
      setReport('dsaReport', dsaRaw);
      setAgentStatus('dsa', 'done');
      
      await sleep(5000); // Prevent rate limits
      
      const sysRaw = await runSysDesignAnalysis(currentCode, targetLanguage);
      setReport('sysDesignReport', sysRaw);
      setAgentStatus('sysdesign', 'done');
      
      await sleep(5000); // Prevent rate limits
      
      const perfRaw = await runPerformanceAnalysis(cobolInput, currentCode, targetLanguage);
      setReport('performanceReport', perfRaw);
      setAgentStatus('performance', 'done');
      
      await sleep(5000); // Prevent rate limits
      
      const bizRaw = await runBizLogicAnalysis(cobolInput, currentCode, targetLanguage);
      setReport('bizLogicReport', bizRaw);
      setAgentStatus('bizlogic', 'done');

      // Mock Test Runner for now
      setAgentStatus('testrunner', 'done');

      await sleep(5000); // Prevent rate limits

      // Stage 3: Bug aggregation
      setAgentStatus('bugreport', 'running');
      const bugReportRaw = await runBugReportAggregation(dsaRaw, sysRaw, perfRaw, bizRaw, iteration);
      
      if (bugReportRaw && bugReportRaw.bugs) {
        bugReportRaw.bugs.forEach((b: any) => appendBugReport(b));
      }
      setAgentStatus('bugreport', 'done');

      if (!bugReportRaw || (bugReportRaw.critical === 0 && bugReportRaw.high === 0)) {
        setPipelineStatus('complete');
        return;
      }

      if (!bugReportRaw.proceed_with_autofix) {
        setPipelineStatus('complete'); // Escalate
        return;
      }

      await sleep(5000); // Prevent rate limits before fix

      // Stage 4: Fix iteration
      setAgentStatus('fix', 'running');
      const fixPrompt = `You are the Fix Agent performing a bug-fix iteration.
ORIGINAL COBOL:
<cobol>${cobolInput}</cobol>

CURRENT ${targetLanguage} CODE:
<code>${currentCode}</code>

BUGS TO FIX:
${JSON.stringify(bugReportRaw.bugs, null, 2)}

Return ONLY the complete fixed code. No explanation, no markdown fences.`;

      const fixResponse = await generateContentWithRetry({
        model: 'gemini-3.1-pro-preview',
        contents: fixPrompt,
        config: { temperature: 0.1 },
      });

      currentCode = fixResponse.text?.replace(/```[a-z]*\n/g, '').replace(/```/g, '').trim() || '';
      setFinalCode(currentCode);
      setAgentStatus('fix', 'done');
      
      await sleep(5000); // Prevent rate limits before next iteration
    }

    setPipelineStatus('complete');
  } catch (error) {
    console.error('Pipeline failed:', error);
    setPipelineStatus('failed');
  }
}

async function runDSAAnalysis(cobol: string, code: string, lang: string) {
  const prompt = `Analyze DSA in this ${lang} code (converted from COBOL).
Original COBOL:
<cobol>${cobol}</cobol>
Converted:
<code>${code}</code>`;

  const res = await generateContentWithRetry({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          structures_found: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, cobol_origin: { type: Type.STRING }, implemented_as: { type: Type.STRING }, recommended: { type: Type.STRING }, is_optimal: { type: Type.BOOLEAN }, issue: { type: Type.STRING } } } },
          algorithms_found: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { function_name: { type: Type.STRING }, cobol_origin: { type: Type.STRING }, algorithm_type: { type: Type.STRING }, current_complexity: { type: Type.STRING }, optimal_complexity: { type: Type.STRING }, is_optimal: { type: Type.BOOLEAN }, improvement_suggestion: { type: Type.STRING } } } },
          overall_dsa_score: { type: Type.NUMBER },
          critical_issues: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(res.text || '{}');
}

async function runSysDesignAnalysis(code: string, lang: string) {
  const prompt = `Review system design of this ${lang} code:
<code>${code}</code>`;

  const res = await generateContentWithRetry({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          solid_violations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { principle: { type: Type.STRING }, location: { type: Type.STRING }, description: { type: Type.STRING }, severity: { type: Type.STRING }, suggestion: { type: Type.STRING } } } },
          coupling_score: { type: Type.NUMBER },
          cohesion_score: { type: Type.NUMBER },
          god_classes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { class_name: { type: Type.STRING }, line_count: { type: Type.NUMBER }, responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } }, split_suggestion: { type: Type.ARRAY, items: { type: Type.STRING } } } } },
          layer_violations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, location: { type: Type.STRING }, fix: { type: Type.STRING } } } },
          overall_design_score: { type: Type.NUMBER },
          architecture_pattern: { type: Type.STRING },
          recommended_pattern: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(res.text || '{}');
}

async function runPerformanceAnalysis(cobol: string, code: string, lang: string) {
  const prompt = `Analyze performance of this ${lang} code:
Original COBOL:
<cobol>${cobol}</cobol>
Converted:
<code>${code}</code>`;

  const res = await generateContentWithRetry({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          function_analysis: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { function_name: { type: Type.STRING }, time_complexity: { type: Type.STRING }, space_complexity: { type: Type.STRING }, cobol_origin: { type: Type.STRING }, has_nested_loops: { type: Type.BOOLEAN }, loop_depth: { type: Type.NUMBER }, issues: { type: Type.ARRAY, items: { type: Type.STRING } } } } },
          hotspots: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { function_name: { type: Type.STRING }, current_complexity: { type: Type.STRING }, impact: { type: Type.STRING }, optimization: { type: Type.STRING } } } },
          antipatterns: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, location: { type: Type.STRING }, description: { type: Type.STRING }, fix: { type: Type.STRING } } } },
          overall_performance_score: { type: Type.NUMBER },
          estimated_improvement_possible: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(res.text || '{}');
}

async function runBizLogicAnalysis(cobol: string, code: string, lang: string) {
  const prompt = `Validate business logic equivalence:
Original COBOL:
<cobol>${cobol}</cobol>
Converted:
<code>${code}</code>`;

  const res = await generateContentWithRetry({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          equivalence_checks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { cobol_construct: { type: Type.STRING }, converted_construct: { type: Type.STRING }, is_equivalent: { type: Type.BOOLEAN }, issue: { type: Type.STRING }, fix: { type: Type.STRING } } } },
          precision_issues: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { cobol_field: { type: Type.STRING }, converted_type: { type: Type.STRING }, expected_type: { type: Type.STRING }, severity: { type: Type.STRING } } } },
          missing_branches: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { cobol_condition: { type: Type.STRING }, location: { type: Type.STRING }, impact: { type: Type.STRING } } } },
          data_loss_risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          overall_equivalence_score: { type: Type.NUMBER },
          verdict: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(res.text || '{}');
}

async function runBugReportAggregation(dsa: any, sys: any, perf: any, biz: any, iteration: number) {
  const prompt = `Aggregate these analysis reports for iteration ${iteration}:
DSA: ${JSON.stringify(dsa)}
SysDesign: ${JSON.stringify(sys)}
Performance: ${JSON.stringify(perf)}
BizLogic: ${JSON.stringify(biz)}`;

  const res = await generateContentWithRetry({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          job_id: { type: Type.STRING },
          iteration: { type: Type.NUMBER },
          total_bugs: { type: Type.NUMBER },
          critical: { type: Type.NUMBER },
          high: { type: Type.NUMBER },
          medium: { type: Type.NUMBER },
          low: { type: Type.NUMBER },
          auto_fixable_count: { type: Type.NUMBER },
          requires_human_review: { type: Type.NUMBER },
          bugs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { bug_id: { type: Type.STRING }, source_agent: { type: Type.STRING }, severity: { type: Type.STRING }, category: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING }, location: { type: Type.OBJECT, properties: { line_start: { type: Type.NUMBER }, line_end: { type: Type.NUMBER }, function_name: { type: Type.STRING } } }, original_cobol_ref: { type: Type.STRING }, evidence: { type: Type.STRING }, suggested_fix: { type: Type.STRING }, auto_fixable: { type: Type.BOOLEAN }, reproducing_test: { type: Type.STRING } } } },
          developer_brief: { type: Type.STRING },
          proceed_with_autofix: { type: Type.BOOLEAN },
          stop_reason: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(res.text || '{}');
}
