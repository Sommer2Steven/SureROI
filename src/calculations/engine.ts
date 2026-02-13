/**
 * calculations/engine.ts
 *
 * The core ROI calculation engine. Pure functions with zero UI dependencies.
 *
 * Two main exports:
 *   1. computeScenario()    — runs the full month-by-month simulation
 *   2. getFormulaDisplays() — generates the "Show the Math" formula cards
 */

import type {
  ScenarioInputs,
  CurrentStateInputs,
  InvestmentInputs,
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

export function calcUpfrontCost(investment: InvestmentInputs): number {
  return investment.assemblyCost + investment.designCost + investment.controlsCost;
}

export function calcRedeploymentCost(investment: InvestmentInputs): number {
  return investment.assemblyCost + investment.designCost + investment.controlsCost + investment.deploymentCost;
}

export function calcCumulativeInvestment(
  investment: InvestmentInputs,
  month: number
): number {
  const upfront = calcUpfrontCost(investment);
  const base = upfront + investment.trainingCost + investment.deploymentCost + investment.monthlyRecurringCost * month;
  if (investment.toolLifespanMonths > 0) {
    const redeployments = Math.floor(month / investment.toolLifespanMonths);
    return base + calcRedeploymentCost(investment) * redeployments;
  }
  return base;
}

// ── Main computation ────────────────────────────────────────────────────

/**
 * Runs the complete ROI simulation for one scenario.
 *
 * @param inputs — the scenario's own inputs
 * @param analysisPeriod — global analysis period (months)
 * @param baselineState — optional. When provided (for proposed scenarios),
 *   the status quo costs are computed from baselineState while the "new tool"
 *   costs are computed from the scenario's own currentState.
 */
export function computeScenario(
  inputs: ScenarioInputs,
  analysisPeriod: number,
  baselineState?: CurrentStateInputs,
): ScenarioResults {
  const { currentState, investment, efficiency } = inputs;

  // Status quo costs — from baseline if provided, otherwise from own currentState
  const sqState = baselineState ?? currentState;
  const sqLabor = calcMonthlyCurrentLabor(sqState.workers, sqState.hourlyRate, sqState.hoursPerWeek);
  const sqRework = calcMonthlyReworkCost(sqLabor, sqState.errorRate);
  const sqTotal = calcTotalMonthlyCurrent(sqLabor, sqRework, sqState.monthlyOperationalCosts);

  // "New tool" base costs — always from the scenario's own currentState
  const proposedLabor = calcMonthlyCurrentLabor(
    currentState.workers, currentState.hourlyRate, currentState.hoursPerWeek
  );
  const proposedRework = calcMonthlyReworkCost(proposedLabor, currentState.errorRate);

  const upfrontCost = calcUpfrontCost(investment);
  const utilization = efficiency.utilizationPercent;

  const monthlyBreakdowns: MonthlyBreakdown[] = [];
  let cumulativeStatusQuo = 0;
  let cumulativeNewTool =
    upfrontCost + investment.trainingCost + investment.deploymentCost;
  let cumulativeSavings = 0;
  let breakEvenMonth: number | null = null;

  for (let month = 1; month <= analysisPeriod; month++) {
    // Add redeployment cost at lifespan boundaries
    if (
      investment.toolLifespanMonths > 0 &&
      month > 1 &&
      (month - 1) % investment.toolLifespanMonths === 0 &&
      month <= analysisPeriod
    ) {
      cumulativeNewTool += calcRedeploymentCost(investment);
    }

    const adoptionRate = linearAdoption(month, efficiency.adoptionRampMonths);

    // Efficiency gains are scaled by utilization
    const effectiveAdoption = adoptionRate * utilization;
    const newLabor = calcNewMonthlyLabor(proposedLabor, efficiency.timeSavings, effectiveAdoption);
    const newRework = calcNewMonthlyRework(proposedRework, efficiency.errorReduction, effectiveAdoption);
    const newTotal = calcNewMonthlyTotal(
      newLabor,
      newRework,
      currentState.monthlyOperationalCosts,
      investment.monthlyRecurringCost
    );

    const monthlySavings =
      sqTotal - newTotal + efficiency.additionalMonthlyRevenue;

    cumulativeStatusQuo += sqTotal;
    cumulativeNewTool += newTotal;
    cumulativeSavings += monthlySavings;

    const cumulativeInvestment = calcCumulativeInvestment(investment, month);

    const netPos = cumulativeStatusQuo - cumulativeNewTool;

    if (breakEvenMonth === null && netPos > 0) {
      breakEvenMonth = month;
    }

    monthlyBreakdowns.push({
      month,
      adoptionRate,
      currentLabor: sqLabor,
      currentRework: sqRework,
      currentTotal: sqTotal,
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

  const totalInvestment = calcCumulativeInvestment(investment, analysisPeriod);

  const lastMonth = monthlyBreakdowns[monthlyBreakdowns.length - 1];
  const threeYearNetSavings = lastMonth?.netPosition ?? 0;

  const year1Investment = calcCumulativeInvestment(investment, Math.min(12, analysisPeriod));
  const month12 = monthlyBreakdowns[11];
  // Guard against divide-by-zero when all defaults are 0
  const year1ROI = month12 && year1Investment > 0
    ? (month12.netPosition / year1Investment) * 100
    : 0;

  const fullAdoptionLabor = calcNewMonthlyLabor(proposedLabor, efficiency.timeSavings, utilization);
  const fullAdoptionRework = calcNewMonthlyRework(proposedRework, efficiency.errorReduction, utilization);
  const fullAdoptionTotal = calcNewMonthlyTotal(
    fullAdoptionLabor,
    fullAdoptionRework,
    currentState.monthlyOperationalCosts,
    investment.monthlyRecurringCost
  );
  const monthlySavingsAtFullAdoption =
    sqTotal - fullAdoptionTotal + efficiency.additionalMonthlyRevenue;

  return {
    scenarioId: inputs.id,
    scenarioName: inputs.name,
    color: inputs.color,
    qualitative: inputs.qualitative,
    monthlyBreakdowns,
    breakEvenMonth,
    year1ROI,
    threeYearNetSavings,
    totalInvestment,
    monthlySavingsAtFullAdoption,
  };
}

// ── Formula registry ────────────────────────────────────────────────────

/**
 * Generates the array of formula cards for the "Show the Math" panel.
 */
export function getFormulaDisplays(
  inputs: ScenarioInputs,
  analysisPeriod: number,
  baselineState?: CurrentStateInputs,
  costLocked?: boolean,
): FormulaDisplay[] {
  const { currentState, investment, efficiency } = inputs;

  const sqState = baselineState ?? currentState;
  const sqLabor = calcMonthlyCurrentLabor(sqState.workers, sqState.hourlyRate, sqState.hoursPerWeek);
  const sqRework = calcMonthlyReworkCost(sqLabor, sqState.errorRate);
  const sqTotal = calcTotalMonthlyCurrent(sqLabor, sqRework, sqState.monthlyOperationalCosts);

  const proposedLabor = calcMonthlyCurrentLabor(
    currentState.workers, currentState.hourlyRate, currentState.hoursPerWeek
  );
  const proposedRework = calcMonthlyReworkCost(proposedLabor, currentState.errorRate);

  const upfrontCost = calcUpfrontCost(investment);
  const utilization = efficiency.utilizationPercent;
  const fullAdoptionLabor = calcNewMonthlyLabor(proposedLabor, efficiency.timeSavings, utilization);
  const fullAdoptionRework = calcNewMonthlyRework(proposedRework, efficiency.errorReduction, utilization);
  const fullAdoptionTotal = calcNewMonthlyTotal(
    fullAdoptionLabor,
    fullAdoptionRework,
    currentState.monthlyOperationalCosts,
    investment.monthlyRecurringCost
  );
  const monthlySavings =
    sqTotal - fullAdoptionTotal + efficiency.additionalMonthlyRevenue;

  const oneTimeInvestment =
    upfrontCost + investment.trainingCost + investment.deploymentCost;

  const formulas: FormulaDisplay[] = [
    {
      id: 'monthly-labor',
      label: 'Monthly Baseline Labor',
      formula: 'workers × hourly_rate × hours/week × 4.33',
      substituted: `${sqState.workers} × ${formatCurrency(sqState.hourlyRate)} × ${sqState.hoursPerWeek} × 4.33`,
      result: formatCurrency(sqLabor),
    },
    {
      id: 'monthly-rework',
      label: 'Monthly Baseline Rework',
      formula: 'monthly_labor × error_rate',
      substituted: `${formatCurrency(sqLabor)} × ${formatPercent(sqState.errorRate)}`,
      result: formatCurrency(sqRework),
    },
    {
      id: 'total-monthly-current',
      label: 'Total Monthly Baseline Cost',
      formula: 'labor + rework + operational_costs',
      substituted: `${formatCurrency(sqLabor)} + ${formatCurrency(sqRework)} + ${formatCurrency(sqState.monthlyOperationalCosts)}`,
      result: formatCurrency(sqTotal),
    },
  ];

  // Show proposed-state formulas when there's a baseline (i.e. this is a proposed scenario)
  if (baselineState) {
    formulas.push(
      {
        id: 'proposed-labor',
        label: 'Proposed Monthly Labor',
        formula: 'workers × hourly_rate × hours/week × 4.33',
        substituted: `${currentState.workers} × ${formatCurrency(currentState.hourlyRate)} × ${currentState.hoursPerWeek} × 4.33`,
        result: formatCurrency(proposedLabor),
      },
      {
        id: 'proposed-rework',
        label: 'Proposed Monthly Rework',
        formula: 'proposed_labor × error_rate',
        substituted: `${formatCurrency(proposedLabor)} × ${formatPercent(currentState.errorRate)}`,
        result: formatCurrency(proposedRework),
      },
    );
  }

  formulas.push(
    {
      id: 'new-monthly-labor',
      label: 'New Monthly Labor (Full Adoption)',
      formula: 'proposed_labor × (1 − time_savings × utilization)',
      substituted: `${formatCurrency(proposedLabor)} × (1 − ${formatPercent(efficiency.timeSavings)} × ${formatPercent(utilization)})`,
      result: formatCurrency(fullAdoptionLabor),
    },
    {
      id: 'new-monthly-rework',
      label: 'New Monthly Rework (Full Adoption)',
      formula: 'proposed_rework × (1 − error_reduction × utilization)',
      substituted: `${formatCurrency(proposedRework)} × (1 − ${formatPercent(efficiency.errorReduction)} × ${formatPercent(utilization)})`,
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
      formula: 'baseline_total − new_total + additional_revenue',
      substituted: `${formatCurrency(sqTotal)} − ${formatCurrency(fullAdoptionTotal)} + ${formatCurrency(efficiency.additionalMonthlyRevenue)}`,
      result: formatCurrency(monthlySavings),
    },
    {
      id: 'one-time-investment',
      label: 'One-Time Investment',
      formula: 'assembly + design + controls + training + deployment',
      substituted: costLocked
        ? `*** + *** + *** + ${formatCurrency(investment.trainingCost)} + ${formatCurrency(investment.deploymentCost)}`
        : `${formatCurrency(investment.assemblyCost)} + ${formatCurrency(investment.designCost)} + ${formatCurrency(investment.controlsCost)} + ${formatCurrency(investment.trainingCost)} + ${formatCurrency(investment.deploymentCost)}`,
      result: formatCurrency(oneTimeInvestment),
    },
  );

  // Redeployment formula card when lifespan is set
  if (investment.toolLifespanMonths > 0) {
    const redeploymentCost = calcRedeploymentCost(investment);
    const redeployments = Math.floor(analysisPeriod / investment.toolLifespanMonths);
    formulas.push({
      id: 'redeployment',
      label: 'Redeployment Cost',
      formula: '(assembly + design + controls + deployment) × floor(period / lifespan)',
      substituted: costLocked
        ? `*** × floor(${analysisPeriod} / ${investment.toolLifespanMonths})`
        : `${formatCurrency(redeploymentCost)} × floor(${analysisPeriod} / ${investment.toolLifespanMonths})`,
      result: `${redeployments} cycle(s) = ${formatCurrency(redeploymentCost * redeployments)}`,
    });
  }

  formulas.push(
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
  );

  return formulas;
}
