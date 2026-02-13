/**
 * types/index.ts
 *
 * Central type definitions for the entire SureROI application.
 * Every interface, action type, and shared constant lives here so that
 * the rest of the codebase imports from a single source of truth.
 */

// ── Status Quo (baseline) inputs ────────────────────────────────────────
// These describe the company's current field operations BEFORE any new tool.
// Each scenario has its own baseline so different "what-if" options can
// compare against different starting points.
export interface CurrentStateInputs {
  workers: number;
  hourlyRate: number;
  hoursPerWeek: number;
  errorRate: number;
  monthlyOperationalCosts: number;
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

// ── Efficiency gain inputs ──────────────────────────────────────────────
export interface EfficiencyInputs {
  timeSavings: number;
  errorReduction: number;
  utilizationPercent: number;
  adoptionRampMonths: number;
  additionalMonthlyRevenue: number;
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
// Each scenario now contains its own current-state baseline, analysis period,
// investment, efficiency, and qualitative flags.
export interface ScenarioInputs {
  id: string;
  name: string;
  color: string;
  currentState: CurrentStateInputs;
  investment: InvestmentInputs;
  efficiency: EfficiencyInputs;
  qualitative: QualitativeFlags;
  costBreakdownLocked: boolean;
}

// ── Monthly breakdown row ───────────────────────────────────────────────
export interface MonthlyBreakdown {
  month: number;
  adoptionRate: number;
  currentLabor: number;
  currentRework: number;
  currentTotal: number;
  newLabor: number;
  newRework: number;
  newTotal: number;
  monthlySavings: number;
  cumulativeStatusQuo: number;
  cumulativeNewTool: number;
  cumulativeInvestment: number;
  cumulativeSavings: number;
  netPosition: number;
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
  monthlySavingsAtFullAdoption: number;
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
  version: 1;
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
  estimatedHours: number;
  excludeDesignControls: boolean;
  startMonth: string;   // "YYYY-MM"
  endMonth: string;     // "YYYY-MM"
  scenario: ScenarioInputs;
  baselineCurrentState: CurrentStateInputs;
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
  | { type: 'UPDATE_ENTRY'; id: string; updates: Partial<Pick<PortfolioEntry, 'estimatedHours' | 'startMonth' | 'endMonth' | 'projectName' | 'excludeDesignControls'>> }
  | { type: 'SET_DEPARTMENT_SALARY'; salary: number }
  | { type: 'SET_PORTFOLIO_NAME'; name: string }
  | { type: 'SET_PORTFOLIO_DESCRIPTION'; description: string }
  | { type: 'LOAD_PORTFOLIO'; portfolio: PortfolioFile }
  | { type: 'RESET_PORTFOLIO' };

// ── UI state types ──────────────────────────────────────────────────────
export type ChartView = 'cumulative' | 'monthly' | 'compare';

// ── Global application state ────────────────────────────────────────────
export interface AppState {
  scenarios: ScenarioInputs[];
  activeScenarioId: string;
  analysisPeriod: number;
  chartView: ChartView;
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
  | { type: 'UPDATE_CURRENT_STATE'; id: string; updates: Partial<CurrentStateInputs> }
  | { type: 'UPDATE_INVESTMENT'; id: string; updates: Partial<InvestmentInputs> }
  | { type: 'UPDATE_EFFICIENCY'; id: string; updates: Partial<EfficiencyInputs> }
  | { type: 'UPDATE_ANALYSIS_PERIOD'; period: number }
  | { type: 'UPDATE_QUALITATIVE'; id: string; updates: Partial<QualitativeFlags> }
  | { type: 'RENAME_SCENARIO'; id: string; name: string }
  | { type: 'DUPLICATE_SCENARIO'; id: string }
  | { type: 'SET_ACTIVE'; id: string }
  | { type: 'SET_CHART_VIEW'; view: ChartView }
  | { type: 'TOGGLE_BREAKDOWN' }
  | { type: 'TOGGLE_MONTHLY_TABLE' }
  | { type: 'SET_PROJECT_TITLE'; title: string }
  | { type: 'SET_PROJECT_DESCRIPTION'; description: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'LOAD_PROJECT'; project: ProjectFile }
  | { type: 'SET_APP_MODE'; mode: AppMode };
