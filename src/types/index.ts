export interface CurrentStateInputs {
  workers: number;
  hourlyRate: number;
  hoursPerWeek: number;
  errorRate: number;
  monthlyOperationalCosts: number;
}

export interface InvestmentInputs {
  upfrontCost: number;
  monthlyRecurringCost: number;
  trainingCost: number;
  deploymentCost: number;
}

export interface EfficiencyInputs {
  timeSavings: number;
  errorReduction: number;
  adoptionRampMonths: number;
  additionalMonthlyRevenue: number;
}

export interface ScenarioInputs {
  id: string;
  name: string;
  color: string;
  investment: InvestmentInputs;
  efficiency: EfficiencyInputs;
}

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

export interface ScenarioResults {
  scenarioId: string;
  scenarioName: string;
  color: string;
  monthlyBreakdowns: MonthlyBreakdown[];
  breakEvenMonth: number | null;
  year1ROI: number;
  threeYearNetSavings: number;
  totalInvestment: number;
  monthlySavingsAtFullAdoption: number;
}

export interface FormulaDisplay {
  id: string;
  label: string;
  formula: string;
  substituted: string;
  result: string;
}

export type ChartView = 'cumulative' | 'monthly' | 'compare';

export const STATUS_QUO_ID = 'status-quo';

export interface AppState {
  currentState: CurrentStateInputs;
  analysisPeriod: number;
  scenarios: ScenarioInputs[];
  activeScenarioId: string;
  chartView: ChartView;
  showBreakdown: boolean;
  showMonthlyTable: boolean;
}

export type AppAction =
  | { type: 'ADD_SCENARIO' }
  | { type: 'REMOVE_SCENARIO'; id: string }
  | { type: 'UPDATE_SCENARIO'; id: string; updates: Partial<ScenarioInputs> }
  | { type: 'UPDATE_CURRENT_STATE'; updates: Partial<CurrentStateInputs> }
  | { type: 'UPDATE_INVESTMENT'; id: string; updates: Partial<InvestmentInputs> }
  | { type: 'UPDATE_EFFICIENCY'; id: string; updates: Partial<EfficiencyInputs> }
  | { type: 'UPDATE_ANALYSIS_PERIOD'; period: number }
  | { type: 'DUPLICATE_SCENARIO'; id: string }
  | { type: 'SET_ACTIVE'; id: string }
  | { type: 'SET_CHART_VIEW'; view: ChartView }
  | { type: 'TOGGLE_BREAKDOWN' }
  | { type: 'TOGGLE_MONTHLY_TABLE' };
