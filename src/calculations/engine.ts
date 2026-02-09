import type {
  CurrentStateInputs,
  ScenarioInputs,
  MonthlyBreakdown,
  ScenarioResults,
  FormulaDisplay,
} from '../types';
import { linearAdoption } from './adoption';
import {
  formatCurrency,
  formatPercent,
} from '../constants/formatting';

const WEEKS_PER_MONTH = 4.33;

// ── Pure calculation functions ──────────────────────────────────────────

export function calcMonthlyCurrentLabor(
  workers: number,
  hourlyRate: number,
  hoursPerWeek: number
): number {
  return workers * hourlyRate * hoursPerWeek * WEEKS_PER_MONTH;
}

export function calcMonthlyReworkCost(
  monthlyLabor: number,
  errorRate: number
): number {
  return monthlyLabor * errorRate;
}

export function calcTotalMonthlyCurrent(
  labor: number,
  rework: number,
  operational: number
): number {
  return labor + rework + operational;
}

export function calcNewMonthlyLabor(
  currentLabor: number,
  timeSavings: number,
  adoptionRate: number
): number {
  return currentLabor * (1 - timeSavings * adoptionRate);
}

export function calcNewMonthlyRework(
  currentRework: number,
  errorReduction: number,
  adoptionRate: number
): number {
  return currentRework * (1 - errorReduction * adoptionRate);
}

export function calcNewMonthlyTotal(
  newLabor: number,
  newRework: number,
  operational: number,
  monthlyRecurring: number
): number {
  return newLabor + newRework + operational + monthlyRecurring;
}

export function calcCumulativeInvestment(
  upfront: number,
  training: number,
  deployment: number,
  monthlyRecurring: number,
  month: number
): number {
  return upfront + training + deployment + monthlyRecurring * month;
}

// ── Main computation ────────────────────────────────────────────────────

export function computeScenario(
  currentState: CurrentStateInputs,
  inputs: ScenarioInputs,
  analysisPeriod: number
): ScenarioResults {
  const { investment, efficiency } = inputs;

  const currentLabor = calcMonthlyCurrentLabor(
    currentState.workers,
    currentState.hourlyRate,
    currentState.hoursPerWeek
  );
  const currentRework = calcMonthlyReworkCost(currentLabor, currentState.errorRate);
  const currentTotal = calcTotalMonthlyCurrent(
    currentLabor,
    currentRework,
    currentState.monthlyOperationalCosts
  );

  const monthlyBreakdowns: MonthlyBreakdown[] = [];
  let cumulativeStatusQuo = 0;
  let cumulativeNewTool =
    investment.upfrontCost + investment.trainingCost + investment.deploymentCost;
  let cumulativeSavings = 0;
  let breakEvenMonth: number | null = null;

  for (let month = 1; month <= analysisPeriod; month++) {
    const adoptionRate = linearAdoption(month, efficiency.adoptionRampMonths);
    const newLabor = calcNewMonthlyLabor(currentLabor, efficiency.timeSavings, adoptionRate);
    const newRework = calcNewMonthlyRework(currentRework, efficiency.errorReduction, adoptionRate);
    const newTotal = calcNewMonthlyTotal(
      newLabor,
      newRework,
      currentState.monthlyOperationalCosts,
      investment.monthlyRecurringCost
    );

    const monthlySavings =
      currentTotal - newTotal + efficiency.additionalMonthlyRevenue;

    cumulativeStatusQuo += currentTotal;
    cumulativeNewTool += newTotal;
    cumulativeSavings += monthlySavings;

    const cumulativeInvestment = calcCumulativeInvestment(
      investment.upfrontCost,
      investment.trainingCost,
      investment.deploymentCost,
      investment.monthlyRecurringCost,
      month
    );

    const netPos = cumulativeStatusQuo - cumulativeNewTool;

    if (breakEvenMonth === null && netPos > 0) {
      breakEvenMonth = month;
    }

    monthlyBreakdowns.push({
      month,
      adoptionRate,
      currentLabor,
      currentRework,
      currentTotal,
      newLabor,
      newRework,
      newTotal,
      monthlySavings,
      cumulativeStatusQuo,
      cumulativeNewTool,
      cumulativeInvestment,
      cumulativeSavings,
      netPosition: netPos,
    });
  }

  const totalInvestment = calcCumulativeInvestment(
    investment.upfrontCost,
    investment.trainingCost,
    investment.deploymentCost,
    investment.monthlyRecurringCost,
    analysisPeriod
  );

  const lastMonth = monthlyBreakdowns[monthlyBreakdowns.length - 1];
  const threeYearNetSavings = lastMonth?.netPosition ?? 0;

  const month12 = monthlyBreakdowns[11];
  const year1Investment = calcCumulativeInvestment(
    investment.upfrontCost,
    investment.trainingCost,
    investment.deploymentCost,
    investment.monthlyRecurringCost,
    Math.min(12, analysisPeriod)
  );
  const year1ROI = month12
    ? (month12.netPosition / year1Investment) * 100
    : 0;

  const fullAdoptionLabor = calcNewMonthlyLabor(currentLabor, efficiency.timeSavings, 1);
  const fullAdoptionRework = calcNewMonthlyRework(currentRework, efficiency.errorReduction, 1);
  const fullAdoptionTotal = calcNewMonthlyTotal(
    fullAdoptionLabor,
    fullAdoptionRework,
    currentState.monthlyOperationalCosts,
    investment.monthlyRecurringCost
  );
  const monthlySavingsAtFullAdoption =
    currentTotal - fullAdoptionTotal + efficiency.additionalMonthlyRevenue;

  return {
    scenarioId: inputs.id,
    scenarioName: inputs.name,
    color: inputs.color,
    monthlyBreakdowns,
    breakEvenMonth,
    year1ROI,
    threeYearNetSavings,
    totalInvestment,
    monthlySavingsAtFullAdoption,
  };
}

// ── Formula registry ────────────────────────────────────────────────────

export function getFormulaDisplays(
  currentState: CurrentStateInputs,
  inputs: ScenarioInputs
): FormulaDisplay[] {
  const { investment, efficiency } = inputs;

  const currentLabor = calcMonthlyCurrentLabor(
    currentState.workers,
    currentState.hourlyRate,
    currentState.hoursPerWeek
  );
  const currentRework = calcMonthlyReworkCost(currentLabor, currentState.errorRate);
  const currentTotal = calcTotalMonthlyCurrent(
    currentLabor,
    currentRework,
    currentState.monthlyOperationalCosts
  );

  const fullAdoptionLabor = calcNewMonthlyLabor(currentLabor, efficiency.timeSavings, 1);
  const fullAdoptionRework = calcNewMonthlyRework(currentRework, efficiency.errorReduction, 1);
  const fullAdoptionTotal = calcNewMonthlyTotal(
    fullAdoptionLabor,
    fullAdoptionRework,
    currentState.monthlyOperationalCosts,
    investment.monthlyRecurringCost
  );
  const monthlySavings =
    currentTotal - fullAdoptionTotal + efficiency.additionalMonthlyRevenue;

  const oneTimeInvestment =
    investment.upfrontCost + investment.trainingCost + investment.deploymentCost;

  return [
    {
      id: 'monthly-labor',
      label: 'Monthly Current Labor',
      formula: 'workers × hourly_rate × hours/week × 4.33',
      substituted: `${currentState.workers} × ${formatCurrency(currentState.hourlyRate)} × ${currentState.hoursPerWeek} × 4.33`,
      result: formatCurrency(currentLabor),
    },
    {
      id: 'monthly-rework',
      label: 'Monthly Rework Cost',
      formula: 'monthly_labor × error_rate',
      substituted: `${formatCurrency(currentLabor)} × ${formatPercent(currentState.errorRate)}`,
      result: formatCurrency(currentRework),
    },
    {
      id: 'total-monthly-current',
      label: 'Total Monthly Current Cost',
      formula: 'labor + rework + operational_costs',
      substituted: `${formatCurrency(currentLabor)} + ${formatCurrency(currentRework)} + ${formatCurrency(currentState.monthlyOperationalCosts)}`,
      result: formatCurrency(currentTotal),
    },
    {
      id: 'new-monthly-labor',
      label: 'New Monthly Labor (Full Adoption)',
      formula: 'current_labor × (1 − time_savings)',
      substituted: `${formatCurrency(currentLabor)} × (1 − ${formatPercent(efficiency.timeSavings)})`,
      result: formatCurrency(fullAdoptionLabor),
    },
    {
      id: 'new-monthly-rework',
      label: 'New Monthly Rework (Full Adoption)',
      formula: 'current_rework × (1 − error_reduction)',
      substituted: `${formatCurrency(currentRework)} × (1 − ${formatPercent(efficiency.errorReduction)})`,
      result: formatCurrency(fullAdoptionRework),
    },
    {
      id: 'new-monthly-total',
      label: 'New Monthly Total (Full Adoption)',
      formula: 'new_labor + new_rework + operational + monthly_recurring',
      substituted: `${formatCurrency(fullAdoptionLabor)} + ${formatCurrency(fullAdoptionRework)} + ${formatCurrency(currentState.monthlyOperationalCosts)} + ${formatCurrency(investment.monthlyRecurringCost)}`,
      result: formatCurrency(fullAdoptionTotal),
    },
    {
      id: 'monthly-savings',
      label: 'Monthly Savings (Full Adoption)',
      formula: 'current_total − new_total + additional_revenue',
      substituted: `${formatCurrency(currentTotal)} − ${formatCurrency(fullAdoptionTotal)} + ${formatCurrency(efficiency.additionalMonthlyRevenue)}`,
      result: formatCurrency(monthlySavings),
    },
    {
      id: 'one-time-investment',
      label: 'One-Time Investment',
      formula: 'upfront + training + deployment',
      substituted: `${formatCurrency(investment.upfrontCost)} + ${formatCurrency(investment.trainingCost)} + ${formatCurrency(investment.deploymentCost)}`,
      result: formatCurrency(oneTimeInvestment),
    },
    {
      id: 'adoption-rate',
      label: 'Adoption Rate (month t)',
      formula: 'min(1, t / adoption_period)',
      substituted: `min(1, t / ${efficiency.adoptionRampMonths})`,
      result: `Linear ramp over ${efficiency.adoptionRampMonths} months`,
    },
    {
      id: 'roi-formula',
      label: 'ROI %',
      formula: '(net_position / cumulative_investment) × 100',
      substituted: `(cumulative_savings − cumulative_investment) / cumulative_investment × 100`,
      result: 'Calculated per month',
    },
  ];
}
