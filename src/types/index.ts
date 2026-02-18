/**
 * types/index.ts
 *
 * Central type definitions for the entire SureROI application.
 * Every interface, action type, and shared constant lives here so that
 * the rest of the codebase imports from a single source of truth.
 */

// ── Savings mode ────────────────────────────────────────────────────────
export type SavingsMode = 'direct' | 'time-based';

// ── Savings inputs (replaces CurrentStateInputs + EfficiencyInputs) ─────
// Two modes:
//   - Direct: user enters a flat $/unit/month savings rate
//   - Time-Based: derives savings from crew/time before-after comparison
export interface SavingsInputs {
  mode: SavingsMode;
  unitName: string;              // "person", "piece", "ton", etc.
  referenceUnits: number;        // for project-level charts/break-even

  // ── Direct mode ──
  directSavingsPerUnit: number;  // $/unit/month

  // ── Time-based mode ──
  currentCrewSize: number;
  proposedCrewSize: number;
  currentTimePerUnit: number;    // minutes
  proposedTimePerUnit: number;   // minutes
  hourlyRate: number;

  // ── Common to both modes ──
  additionalSavingsPerUnit: number; // $/unit/month (materials, rework, etc.)
  utilizationPercent: number;       // 0-1
  adoptionRampMonths: number;       // 1-24
}

// ── New tool investment inputs ──────────────────────────────────────────
export interface InvestmentInputs {
  assemblyCost: number;
  designCost: number;
  controlsCost: number;
  monthlyRecurringCost: number;
  trainingCost: number;
  deploymentCost: number;
  toolLifespanMonths: number;
}

// ── Qualitative flags ───────────────────────────────────────────────────
// Non-numeric indicators that help stakeholders assess strategic value.
export interface QualitativeFlags {
  safetyCritical: boolean;
  qualityCritical: boolean;
  operationsCritical: boolean;
}

// ── Scenario ────────────────────────────────────────────────────────────
// A scenario represents one "what if" option (e.g. "Build custom" vs. "Buy SaaS").
// Each scenario contains its own savings definition, investment, and qualitative flags.
export interface ScenarioInputs {
  id: string;
  name: string;
  color: string;
  savings: SavingsInputs;
  investment: InvestmentInputs;
  qualitative: QualitativeFlags;
  costBreakdownLocked: boolean;
}

// ── Monthly breakdown row ───────────────────────────────────────────────
export interface MonthlyBreakdown {
  month: number;
  adoptionRate: number;
  monthlySavings: number;         // savingsPerUnit x units x effectiveAdoption
  monthlyInvestmentCost: number;  // recurring + redeployment this month
  cumulativeSavings: number;
  cumulativeInvestment: number;
  netPosition: number;            // cumulativeSavings - cumulativeInvestment
}

// ── Scenario results (output of the calculation engine) ─────────────────
export interface ScenarioResults {
  scenarioId: string;
  scenarioName: string;
  color: string;
  qualitative: QualitativeFlags;
  monthlyBreakdowns: MonthlyBreakdown[];
  breakEvenMonth: number | null;
  year1ROI: number;
  threeYearNetSavings: number;
  totalInvestment: number;
  savingsPerUnit: number;                 // computed total $/unit/month (at full adoption)
  monthlySavingsAtFullAdoption: number;   // savingsPerUnit x referenceUnits x utilization
}

// ── Formula display (for the "Show the Math" panel) ─────────────────────
export interface FormulaDisplay {
  id: string;
  label: string;
  formula: string;
  substituted: string;
  result: string;
}

// ── Saved project file format ───────────────────────────────────────────
export interface ProjectFile {
  version: 1 | 2;
  projectTitle: string;
  projectDescription: string;
  analysisPeriod: number;
  darkMode: boolean;
  scenarios: ScenarioInputs[];
}

// ── App mode ──────────────────────────────────────────────────────────
export type AppMode = 'project' | 'portfolio';

// ── Portfolio types ───────────────────────────────────────────────────
export interface PortfolioEntry {
  id: string;
  projectName: string;
  scenarioName: string;
  actualUnits: number;
  toolCount: number;
  excludeDesignControls: boolean;
  excludeTraining: boolean;
  hidden?: boolean;
  startMonth: string;   // "YYYY-MM"
  endMonth: string;     // "YYYY-MM"
  scenario: ScenarioInputs;
  baselineSavings: SavingsInputs;
  analysisPeriod: number;
  sourceFileName: string;
}

export type PortfolioChartView = 'monthly-savings' | 'net-position';

export interface PortfolioFile {
  version: 1;
  portfolioName: string;
  portfolioDescription: string;
  departmentAnnualSalary: number;
  entries: PortfolioEntry[];
}

export interface PortfolioState {
  entries: PortfolioEntry[];
  departmentAnnualSalary: number;
  portfolioName: string;
  portfolioDescription: string;
}

export type PortfolioAction =
  | { type: 'ADD_ENTRY'; entry: PortfolioEntry }
  | { type: 'REMOVE_ENTRY'; id: string }
  | { type: 'UPDATE_ENTRY'; id: string; updates: Partial<Pick<PortfolioEntry, 'actualUnits' | 'toolCount' | 'startMonth' | 'endMonth' | 'projectName' | 'excludeDesignControls' | 'excludeTraining' | 'hidden'>> }
  | { type: 'SET_DEPARTMENT_SALARY'; salary: number }
  | { type: 'SET_PORTFOLIO_NAME'; name: string }
  | { type: 'SET_PORTFOLIO_DESCRIPTION'; description: string }
  | { type: 'LOAD_PORTFOLIO'; portfolio: PortfolioFile }
  | { type: 'RESET_PORTFOLIO' };

// ── Global application state ────────────────────────────────────────────
export interface AppState {
  scenarios: ScenarioInputs[];
  activeScenarioId: string;
  analysisPeriod: number;
  showBreakdown: boolean;
  showMonthlyTable: boolean;
  projectTitle: string;
  projectDescription: string;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  appMode: AppMode;
}

// ── Reducer action types ────────────────────────────────────────────────
export type AppAction =
  | { type: 'ADD_SCENARIO' }
  | { type: 'REMOVE_SCENARIO'; id: string }
  | { type: 'UPDATE_SCENARIO'; id: string; updates: Partial<ScenarioInputs> }
  | { type: 'UPDATE_SAVINGS'; id: string; updates: Partial<SavingsInputs> }
  | { type: 'UPDATE_INVESTMENT'; id: string; updates: Partial<InvestmentInputs> }
  | { type: 'UPDATE_ANALYSIS_PERIOD'; period: number }
  | { type: 'UPDATE_QUALITATIVE'; id: string; updates: Partial<QualitativeFlags> }
  | { type: 'RENAME_SCENARIO'; id: string; name: string }
  | { type: 'DUPLICATE_SCENARIO'; id: string }
  | { type: 'SET_ACTIVE'; id: string }
  | { type: 'TOGGLE_BREAKDOWN' }
  | { type: 'TOGGLE_MONTHLY_TABLE' }
  | { type: 'SET_PROJECT_TITLE'; title: string }
  | { type: 'SET_PROJECT_DESCRIPTION'; description: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'LOAD_PROJECT'; project: ProjectFile }
  | { type: 'SET_APP_MODE'; mode: AppMode }
  | { type: 'RESET_PROJECT' };
