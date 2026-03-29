# Mainframe Modernizer

A web application that converts legacy **COBOL** code into modern programming languages using a multi-agent AI pipeline powered by Google Gemini. Beyond simple translation, it runs a full suite of automated analysis agents — DSA, system design, performance, business logic, and testing — before iteratively fixing issues in the generated code.




https://github.com/user-attachments/assets/06b88a43-eb79-4635-83bf-e51a90811597


---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Agent Pipeline](#agent-pipeline)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Supported Target Languages](#supported-target-languages)
- [Analysis Reports](#analysis-reports)
- [Known Limitations & TODOs](#known-limitations--todos)
- [Code Explanation](#code-explanation)

---

## Overview

Legacy COBOL systems power a significant portion of the world's financial, insurance, and government infrastructure. Migrating them to modern languages is expensive, error-prone, and requires deep institutional knowledge. Mainframe Modernizer automates this process end-to-end:

1. A **Developer Agent** performs the initial COBOL → target language conversion.
2. A fleet of **Specialist Analysis Agents** review the generated code across four dimensions.
3. A **Bug Report Agent** aggregates findings into a structured, prioritised bug list.
4. A **Fix Agent** applies auto-fixes and iterates — up to three times — until the code is clean or human review is required.

The entire pipeline runs in the browser, with real-time status updates visualised in an agent card dashboard.

---

## Features

- **Multi-language conversion** — Python 3.11, Java 17, C# 12, Go 1.22, JavaScript ES2024, TypeScript 5
- **Monaco Editor** — full syntax-highlighted editor for both COBOL input and converted output
- **File upload** — load `.cbl`, `.cob`, `.cobol`, or `.txt` COBOL files directly
- **Code download** — export converted code with the correct file extension
- **Agent pipeline visualiser** — live animated cards showing each agent's status (`idle → running → done / failed`)
- **Four analysis dashboards** — DSA, System Design, Performance, Business Logic
- **Structured JSON bug reports** — each bug has ID, severity, category, location, evidence, and a suggested fix
- **Iterative auto-fix loop** — up to `MAX_ITERATIONS = 3` fix passes before escalating to human review
- **Rate-limit resilience** — exponential-backoff retry on Gemini 429 errors; 5-second pauses between agent calls
- **Light / dark theme** — full M3-compatible token set defined in `theme/tokens.ts`
- **Responsive layout** — collapsible sidebar, mobile-friendly with backdrop overlay

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    React App                    │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Input    │  │ Control  │  │ Output       │   │
│  │ Panel    │  │ Bar      │  │ Panel        │   │
│  │ (Monaco) │  │          │  │ (Monaco)     │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │       AgentPipelineVisualizer           │    │
│  │  [Dev] → [DSA][SysD][Perf][Biz][Test]   │    │
│  │       → [BugReport] → [Fix]             │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │          AnalysisDashboard              │    │
│  │  DSA | System Design | Perf | BizLogic  │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
  Zustand Stores            geminiClient.ts
  agentStore                runPipeline()
  analysisStore             Google GenAI SDK
```

State is managed entirely through two Zustand stores:

- **`agentStore`** — tracks agent statuses, pipeline status, bug reports, and the final converted code
- **`analysisStore`** — holds the structured JSON reports from each specialist analysis agent

---

## Agent Pipeline

The pipeline runs sequentially to respect Gemini API rate limits.

```
COBOL Input
    │
    ▼
┌─────────────────────────────────────┐
│  Stage 1 — Developer Agent          │
│  Model: gemini-3.1-pro-preview      │
│  Converts COBOL → target language   │
│  temperature: 0.1                   │
└──────────────────┬──────────────────┘
                   │
                   ▼  (× up to 3 iterations)
┌─────────────────────────────────────────────────┐
│  Stage 2 — Analysis Agents                      │
│  Model: gemini-3-flash-preview                  │
│  Structured JSON output (enforced schema)       │
│                                                 │
│  • DSA Agent         data structures & algos    │
│  • SysDesign Agent   SOLID, coupling, cohesion  │
│  • Performance Agent complexity, hotspots       │
│  • BizLogic Agent    semantic equivalence check │
│  • TestRunner Agent  (mocked, placeholder)      │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  Stage 3 — Bug Report Agent         │
│  Aggregates all four reports        │
│  Outputs prioritised BugReport[]    │
│  Decides: proceed_with_autofix?     │
└──────────────────┬──────────────────┘
                   │
         ┌─────────┴──────────┐
         │ critical/high > 0  │ none found
         ▼                    ▼
┌─────────────────┐       Pipeline Complete ✓
│  Stage 4        │
│  Fix Agent      │
│  Patches code   │
│  → back to      │
│  Stage 2        │
└─────────────────┘
         │
    3 iterations exhausted
    or human review needed
         │
         ▼
  Pipeline Complete
  (with open bugs logged)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.8 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| State management | Zustand 5 |
| Code editor | Monaco Editor (`@monaco-editor/react`) |
| AI API | Google Gemini (`@google/genai`) |
| Animations | Motion (`motion/react`) |
| Icons | Lucide React |
| Theme tokens | Custom M3-compatible design tokens |

---

## Project Structure

```
mainframe-modernizer/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── metadata.json
└── src/
    ├── main.tsx                           # App entry point
    ├── App.tsx                            # Root — view routing, pipeline trigger
    ├── index.css
    ├── components/
    │   ├── layout/
    │   │   └── AppShell.tsx               # Sidebar nav, header, responsive shell
    │   ├── workspace/
    │   │   ├── ControlBar.tsx             # Language selector + Start Conversion button
    │   │   ├── InputPanel.tsx             # Monaco COBOL editor, file upload
    │   │   └── OutputPanel.tsx            # Monaco output editor, download
    │   ├── agents/
    │   │   └── AgentPipelineVisualizer.tsx  # Animated agent status cards
    │   └── analysis/
    │       └── AnalysisDashboard.tsx      # Tabbed report viewer (DSA/Sys/Perf/Biz)
    ├── services/
    │   └── geminiClient.ts                # Pipeline orchestration, all Gemini calls
    ├── store/
    │   ├── agentStore.ts                  # Pipeline & agent state (Zustand)
    │   └── analysisStore.ts               # Analysis report state (Zustand)
    ├── types/
    │   ├── agents.ts                      # AgentRole, AgentStatus, BugReport types
    │   └── analysis.ts                    # DSA/SysDesign/Perf/BizLogic report types
    └── theme/
        └── tokens.ts                      # M3 light/dark color token sets
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Google AI Studio](https://aistudio.google.com/) API key with access to Gemini models

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd mainframe-modernizer

# Install dependencies
npm install

# Copy the environment file and add your API key
cp .env.example .env
# Edit .env and set GEMINI_API_KEY
```

### Development

```bash
npm run dev
# App runs at http://localhost:3000
```

### Build

```bash
npm run build
```

### Type check

```bash
npm run lint   # runs tsc --noEmit
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Your Google AI Studio API key. Injected automatically at runtime when hosted on Google AI Studio Cloud Run. |
| `APP_URL` | Optional | The URL where the app is hosted. Used for self-referential links and OAuth callbacks. |

When running locally, set these in a `.env` file at the project root.

---

## Supported Target Languages

| Language | Version | Output Extension |
|---|---|---|
| Python | 3.11 | `.py` |
| Java | 17 | `.java` |
| C# | 12 | `.cs` |
| Go | 1.22 | `.go` |
| JavaScript | ES2024 | `.js` |
| TypeScript | 5 | `.ts` |

---

## Analysis Reports

Each specialist agent returns a structured JSON report conforming to a strict Gemini response schema.

### DSA Report
- Data structures found — name, COBOL origin, current implementation, recommended alternative, optimality flag
- Algorithms found — function name, type, current vs. optimal Big-O complexity
- Overall DSA score (0–100)
- Critical issues list

### System Design Report
- SOLID violations — principle, location, severity, suggestion
- Coupling and cohesion scores
- God classes — class name, line count, responsibilities, split suggestions
- Layer violations
- Overall design score, current architecture pattern, recommended pattern

### Performance Report
- Per-function time and space complexity
- Hotspots — function name, complexity, impact level, optimisation suggestion
- Anti-patterns detected: `STRING_CONCAT_LOOP`, `IO_IN_LOOP`, `REPEATED_ALLOCATION`, `UNNECESSARY_SORT`
- Overall performance score and estimated improvement potential

### Business Logic Report
- Equivalence checks — COBOL construct vs. converted construct, pass/fail, fix suggestion
- Precision issues — field type mismatches that could cause data loss (`CRITICAL` / `HIGH`)
- Missing branches — COBOL conditions not carried over to the converted code
- Data loss risks
- Overall equivalence score
- Verdict: `SAFE` | `REVIEW_REQUIRED` | `DO_NOT_USE`

### Bug Severity Levels

`CRITICAL` → `HIGH` → `MEDIUM` → `LOW` → `INFO`

Bugs with severity `CRITICAL` or `HIGH` trigger an automatic fix iteration. If `proceed_with_autofix` is `false`, the pipeline halts and escalates to human review.

---

## Known Limitations & TODOs

- **Test Runner Agent is mocked** — the `testrunner` agent always reports `done` without executing real tests. Integration with a code execution sandbox (e.g. JDoodle) is planned.
- **History, Reports, and Settings views** are placeholder screens showing an "under development" message.
- **Dark mode toggle is hidden** — the button is rendered but suppressed with `className="... hidden"`. The full M3 dark token set is implemented in `theme/tokens.ts` and ready to wire up.
- **No backend persistence** — conversion results, bug reports, and analysis outputs exist only in memory for the current session.
- **Rate limits** — the pipeline inserts 5-second delays between agent calls and retries on 429 errors, but sustained Gemini quota exhaustion on large COBOL programs can still cause failures.
- **Single-file COBOL only** — no support for COBOL copybooks (`.cpy`) or multi-file COBOL programs.

---

## Code Explanation

A file-by-file and layer-by-layer walkthrough of the entire codebase.

---

### Entry Point — `src/main.tsx`

Standard React 19 entry point. Calls `createRoot` on `#root` and mounts `<App />`. Nothing unusual here — all application logic lives downstream.

---

### `src/App.tsx` — Root Orchestrator

The top-level component. Owns four pieces of React state:

- `mode` — `'light' | 'dark'` for theme toggling (wired but visually hidden)
- `cobolInput` — the COBOL source string, pre-seeded with a `DEFAULT_COBOL` hello-world program demonstrating `IDENTIFICATION DIVISION`, `WORKING-STORAGE SECTION`, `PERFORM UNTIL`, and `STOP RUN`
- `targetLanguage` — which language to convert to, defaults to `'python'`
- `activeView` — which screen is active: `'convert'`, `'analyze'`, or any placeholder view

`handleConvert()` calls `runPipeline(cobolInput, targetLanguage)` from the service layer. The call is fire-and-forget — the pipeline mutates Zustand stores directly, so `App` doesn't need to await or handle a return value.

The render tree is:

```
<AppShell>
  if 'convert':
    <ControlBar />
    <AgentPipelineVisualizer />
    <InputPanel /> + <OutputPanel />   ← side by side on md+
    <AnalysisDashboard />
  if 'analyze':
    <AnalysisDashboard />
  else:
    "Under development" placeholder
</AppShell>
```

---

### Layout — `src/components/layout/AppShell.tsx`

A classic shell layout: persistent sidebar on desktop, slide-in drawer on mobile.

**Sidebar** has two nav groups separated by a divider:
- Top group: Convert, Analyze, Test Runner
- Bottom group: History, Reports, Settings

Each item is a `<button>` (not `<a>`) that calls `setActiveView()`. The active item is highlighted with `bg-blue-50 text-blue-700`. On mobile, clicking any nav item also calls `setMobileOpen(false)` to close the drawer.

**Mobile behaviour**: a `fixed inset-0` backdrop overlay captures clicks outside the open drawer and closes it. The sidebar uses `transform transition-transform` — it translates off-screen (`-translate-x-full`) when closed and slides in (`translate-x-0`) when open. This avoids layout shifts since the sidebar sits in a fixed layer.

**Header**: displays the current view name (capitalised, hyphens replaced with spaces) plus a user avatar button. The dark mode toggle button exists in JSX but carries `className="... hidden"` — intentionally suppressed until dark mode is fully wired.

---

### Workspace Components

#### `src/components/workspace/ControlBar.tsx`

Two interactive elements:

1. A `<select>` dropdown listing all six target languages — disabled while `pipelineStatus === 'running'`
2. A "Start Conversion" button that switches to "Converting..." with a spinning `<Loader2>` icon while running

Both read `pipelineStatus` from `agentStore` via Zustand. The button is `disabled={isRunning}` and its hover/active styles are removed in that state.

#### `src/components/workspace/InputPanel.tsx`

A Monaco Editor (`@monaco-editor/react`) with `defaultLanguage="cobol"`. The toolbar above it provides four icon buttons:

- **Copy** — `navigator.clipboard.writeText(value)`
- **Paste** — `navigator.clipboard.readText()` then calls `onChange(text)`
- **Clear** — calls `onChange('')`
- **Upload** — a hidden `<input type="file" accept=".cbl,.cob,.cobol,.txt">` triggered via a `useRef`. On change, reads the file as text using `FileReader` and calls `onChange(content)`. The input's value is reset to `''` after each upload so the same file can be re-selected immediately.

Copy and Clear are `disabled={!value}` — greyed out when the editor is empty.

#### `src/components/workspace/OutputPanel.tsx`

Structurally mirrors `InputPanel` but reads `finalCode` from `agentStore` rather than local state. The toolbar swaps Upload for a **Download** button.

Download creates a `Blob` from `finalCode`, generates an object URL, programmatically clicks a hidden `<a>` element, then immediately revokes the URL to release memory. The file extension is determined by a `switch` on the active language: `.py`, `.java`, `.cs`, `.go`, `.js`, `.ts`.

A helper `getMonacoLanguage()` maps the app's internal language strings to Monaco's language IDs (e.g. `'csharp'` → `'csharp'`, `'go'` → `'go'`).

The Monaco editor here is **not** `readOnly` — users can manually edit the converted output before downloading.

---

### `src/components/agents/AgentPipelineVisualizer.tsx`

Renders the 8-agent pipeline as animated status cards. Each agent maps to a Lucide icon:

| Agent | Icon |
|---|---|
| `developer` | `Code2` |
| `dsa` | `Database` |
| `sysdesign` | `LayoutTemplate` |
| `performance` | `Gauge` |
| `bizlogic` | `Briefcase` |
| `testrunner` | `TestTube` |
| `bugreport` | `Bug` |
| `fix` | `Wrench` |

**`AgentCard`** is a `motion.div` (from `motion/react`) with `layout`, `initial={{ opacity: 0, y: 20 }}`, and `animate={{ opacity: 1, y: 0 }}`. Border and background colour are driven by status:

- `running` → blue border + `box-shadow` glow + a ping-animation dot in the top-right corner
- `done` → emerald border + faint green background
- `failed` → red border + faint red background
- `idle` / `waiting` → plain grey border, white background

**`StatusIcon`** renders an inline icon matching the status:

- `running` → `<Loader2 className="animate-spin">` in blue
- `done` → `<CheckCircle2>` in emerald
- `failed` → `<XCircle>` in red
- `waiting` / `idle` → `<CircleDashed>` in grey

The visual layout arranges the Developer agent prominently at the top, the five analysis agents in a horizontal row beneath it, then the Bug Report and Fix agents below that — connected by directional arrows to communicate the sequential flow.

---

### `src/components/analysis/AnalysisDashboard.tsx`

A tabbed interface with four tabs: DSA, System Design, Performance, Business Logic. Each tab reads its report from `analysisStore`.

Before the pipeline runs, reports are `null` and tabs show an empty state. Once populated, each report renders its structured data — scores, violation lists, complexity tables, equivalence checks — using cards and severity badges.

The Business Logic tab includes a prominent **verdict banner**: `SAFE` (green), `REVIEW_REQUIRED` (amber), or `DO_NOT_USE` (red), derived directly from the `verdict` field in the `BusinessLogicReport`.

---

### State Management — Zustand Stores

#### `src/store/agentStore.ts`

```ts
interface AgentState {
  agents: Record<AgentRole, AgentInfo>  // status + score per agent
  bugReports: BugReport[]               // accumulated across all iterations
  finalCode: string                     // latest version of converted code
  pipelineStatus: PipelineStatus        // idle | running | complete | failed
}
```

Key design decision: `bugReports` uses `appendBugReport` (push), not replace. Bugs accumulate across all fix iterations so the full issue history is preserved.

`resetPipeline()` resets everything back to `initialAgents` — all agents idle, empty code, empty bug list.

#### `src/store/analysisStore.ts`

Holds four nullable report objects: `dsaReport`, `sysDesignReport`, `performanceReport`, `bizLogicReport`. `setReport(type, report)` is a generic setter keyed on report type. `resetReports()` nulls all four. Both stores are reset at the very start of every `runPipeline()` call.

---

### `src/services/geminiClient.ts` — The Pipeline Engine

The most important file. Exports one function: `runPipeline(cobolInput, targetLanguage)`.

#### Retry Logic

`generateContentWithRetry()` wraps every Gemini API call. It retries up to 5 times on `RESOURCE_EXHAUSTED` / `429` errors with a linearly increasing delay: `15000ms × (attempt + 1)` — so 15s, 30s, 45s, 60s, 75s. Any other error is re-thrown immediately.

#### Stage 1 — Developer Agent

```
model:       gemini-3.1-pro-preview
temperature: 0.1
prompt:      "Convert this COBOL to {lang}. Return ONLY the converted code.
              Zero explanations, zero markdown fences.
              Semantic equivalence is non-negotiable."
```

The response text has markdown fences stripped with two regexes (`` /```[a-z]*\n/g `` and `` /```/g ``). The cleaned code is written to `finalCode` via `setFinalCode()` and stored in the local `currentCode` variable that travels through the iteration loop.

After Stage 1 the pipeline sleeps 5 seconds before entering the iteration loop.

#### The Iteration Loop (`MAX_ITERATIONS = 3`)

Each iteration runs Stages 2, 3, and conditionally Stage 4.

**Stage 2** runs the four analysis agents **sequentially** — not in parallel — with 5-second sleeps between each call to avoid rate-limiting. All analysis agents use `gemini-3-flash-preview` with `responseMimeType: 'application/json'` and a full `responseSchema`. Gemini enforces the schema server-side, so responses are always valid JSON matching the expected shape.

The five analysis functions:

**`runDSAAnalysis`** — prompts for data structure and algorithm review against the original COBOL. Schema enforces: `structures_found[]`, `algorithms_found[]`, `overall_dsa_score` (number 0–100), `critical_issues[]`.

**`runSysDesignAnalysis`** — reviews SOLID principles, coupling, cohesion, and layer boundaries. Schema enforces: `solid_violations[]` (each with `principle`, `location`, `severity`, `suggestion`), `coupling_score`, `cohesion_score`, `god_classes[]`, `layer_violations[]`, `overall_design_score`, `architecture_pattern`, `recommended_pattern`.

**`runPerformanceAnalysis`** — analyses time/space complexity per function. Schema enforces: `function_analysis[]`, `hotspots[]`, `antipatterns[]` (typed union: `STRING_CONCAT_LOOP | IO_IN_LOOP | REPEATED_ALLOCATION | UNNECESSARY_SORT`), `overall_performance_score`, `estimated_improvement_possible`.

**`runBizLogicAnalysis`** — validates semantic equivalence between COBOL and the converted code, checking for missing branches and precision loss. Schema enforces: `equivalence_checks[]`, `precision_issues[]`, `missing_branches[]`, `data_loss_risks[]`, `overall_equivalence_score`, `verdict` (`SAFE | REVIEW_REQUIRED | DO_NOT_USE`).

**TestRunner** is mocked — `setAgentStatus('testrunner', 'done')` is called immediately with no API request.

**Stage 3 — Bug Report Aggregation**

Passes all four raw JSON analysis objects to `runBugReportAggregation()`. The model aggregates and deduplicates findings into a canonical `BugReport[]`. Each bug contains:

| Field | Description |
|---|---|
| `bug_id` | Unique identifier |
| `source_agent` | Which analysis agent found it |
| `severity` | `CRITICAL \| HIGH \| MEDIUM \| LOW \| INFO` |
| `category` | One of 12 typed categories (e.g. `DSA_WRONG_ALGORITHM`, `BIZLOGIC_PRECISION_LOSS`) |
| `title` | Short description |
| `description` | Full explanation |
| `location` | `{ line_start, line_end, function_name }` |
| `original_cobol_ref` | The COBOL construct that caused the bug |
| `evidence` | Supporting evidence from the analysis |
| `suggested_fix` | Human-readable fix suggestion |
| `auto_fixable` | Boolean — whether the Fix Agent can handle it |
| `reproducing_test` | A test case that would expose the bug |

The aggregation response also includes top-level counts (`critical`, `high`, `medium`, `low`) and a `proceed_with_autofix` boolean that Gemini determines based on bug severity and fixability.

**Exit conditions checked after Stage 3:**

1. No critical or high severity bugs → `setPipelineStatus('complete')`, return early ✓
2. `proceed_with_autofix === false` → `setPipelineStatus('complete')`, return (escalate to human review)
3. Otherwise → continue to Stage 4

**Stage 4 — Fix Agent**

```
model:       gemini-3.1-pro-preview
temperature: 0.1
prompt:      original COBOL + current {lang} code + full bug list (JSON)
             → "Return ONLY the complete fixed code. No explanation, no markdown fences."
```

The fixed code replaces both `currentCode` (local) and `finalCode` (store). The loop then increments the iteration counter and Stage 2 runs again on the new code. After 3 iterations, `setPipelineStatus('complete')` is called unconditionally.

The outer `try/catch` catches any unhandled error (e.g. max retries exceeded) and calls `setPipelineStatus('failed')`.

---

### Type System

#### `src/types/agents.ts`

| Type | Description |
|---|---|
| `AgentRole` | Union of 8 literal strings: `developer \| dsa \| sysdesign \| performance \| bizlogic \| testrunner \| bugreport \| fix` |
| `AgentStatus` | `idle \| running \| done \| failed \| waiting` |
| `PipelineStatus` | `idle \| running \| complete \| failed` |
| `BugCategory` | 12-value union covering all analysis dimensions and runtime errors |
| `BugReport` | Full bug shape with optional location fields |
| `PipelineEvent` | Event shape for streaming pipeline updates (typed but not yet used for streaming — the pipeline uses direct store mutations instead) |

#### `src/types/analysis.ts`

Five report interfaces mapping exactly to the Gemini response schemas: `DSAReport`, `SystemDesignReport`, `PerformanceReport`, `BusinessLogicReport`, `TestResult`.

`TestResult` is fully typed — test suite name, pass/fail/skip counts, coverage percentage, duration, and failed test details with stack traces — even though it is not yet populated. The schema is ready for when the TestRunner agent is implemented.

---

### Theme — `src/theme/tokens.ts`

Two full M3 colour token sets (`lightTokens`, `darkTokens`) covering every standard M3 surface and role:

- `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer`
- `secondary`, `tertiary`, `error` (and their on/container variants)
- `background`, `surface`, `surfaceVariant`
- All five `surfaceContainer` levels: `Lowest`, `Low`, (base), `High`, `Highest`

The `tertiary` colour is deliberately set to amber — `#7D5700` in light mode, `#FFBA46` in dark — a nod to the amber phosphor terminals that COBOL originally ran on.

These tokens are defined but not yet dynamically applied to the UI. The components currently use hardcoded Tailwind classes. Wiring these tokens into CSS custom properties (e.g. via a `<style>` tag injected at root) would enable full M3 theming with a single toggle.

---

### Data Flow Summary

```
User types COBOL
    → InputPanel → cobolInput (App state)

User clicks "Start Conversion"
    → handleConvert() → runPipeline(cobolInput, targetLanguage)

runPipeline() writes to Zustand stores directly:
    → agentStore.setAgentStatus()     → AgentPipelineVisualizer re-renders
    → agentStore.setFinalCode()       → OutputPanel shows converted code live
    → analysisStore.setReport()       → AnalysisDashboard populates tabs
    → agentStore.appendBugReport()    → bug list grows per iteration
    → agentStore.setPipelineStatus()  → ControlBar enables/disables button

Pipeline complete
    → pipelineStatus = 'complete'
    → ControlBar re-enables the Convert button

User downloads output
    → OutputPanel creates Blob → programmatic <a> click → browser saves file
```

Every UI update is reactive — no prop drilling, no callbacks from the service layer back to components. The service writes to the store; components subscribe and re-render automatically. This means `runPipeline()` can be called from anywhere without the call site needing to manage any UI state.
