/**
 * calculations/engine.ts
 *
 * The core ROI calculation engine. Pure functions with zero UI dependencies.
 *
 * Two main exports:
 *   1. computeScenario()    — runs the full month-by-month simulation
 *   2. getFormulaDisplays() — generates the "Show the Math" formula cards
 *
 * Rate-based model: the project defines per-unit savings rates and the
 * portfolio applies those rates to actual deployment quantities.
 */

import type {
  SavingsInputs,
  InvestmentInputs,
  MonthlyBreakdown,
  ScenarioInputs,
  ScenarioResults,
  FormulaDisplay,
} from '../types';
import { linearAdoption } from './adoption';
import {
  formatCurrency,
  formatCurrencyDecimals,
  formatPercent,
  formatNumber,
} from '../constants/formatting';

// ── Pure calculation functions ──────────────────────────────────────────

/** Derive the savings per unit from savings inputs. */
export function computeSavingsPerUnit(savings: SavingsInputs): number {
  let laborSavings = 0;
  if (savings.mode === 'time-based' && savings.currentTimePerUnit > 0) {
    const currentCostPerUnit =
      (savings.currentCrewSize * savings.currentTimePerUnit / 60) * savings.hourlyRate;
    const proposedCostPerUnit =
      (savings.proposedCrewSize * savings.proposedTimePerUnit / 60) * savings.hourlyRate;
    laborSavings = currentCostPerUnit - proposedCostPerUnit;
  } else if (savings.mode === 'direct') {
    laborSavings = savings.directSavingsPerUnit;
  }
  return Math.max(0, laborSavings + savings.additionalSavingsPerUnit);
}

export function calcUpfrontCost(investment: InvestmentInputs): number {
  return investment.assemblyCost + investment.designCost + investment.controlsCost;
}

export function calcRedeploymentCost(investment: InvestmentInputs): number {
  return investment.assemblyCost + investment.designCost + investment.controlsCost + investment.deploymentCost;
}

// ── Main computation ────────────────────────────────────────────────────

/**
 * Runs the complete ROI simulation for one scenario.
 *
 * @param inputs — the scenario's inputs (savings + investment)
 * @param analysisPeriod — analysis period in months
 */
export function computeScenario(
  inputs: ScenarioInputs,
  analysisPeriod: number,
): ScenarioResults {
  const { savings, investment } = inputs;
  const perUnitRate = computeSavingsPerUnit(savings);
  const units = Math.max(1, savings.referenceUnits);
  const utilization = savings.utilizationPercent;

  const upfront = calcUpfrontCost(investment) + investment.trainingCost + investment.deploymentCost;
  const monthlyBreakdowns: MonthlyBreakdown[] = [];
  let cumulativeSavings = 0;
  let cumulativeInvestment = upfront;
  let breakEvenMonth: number | null = null;

  for (let month = 1; month <= analysisPeriod; month++) {
    // Redeployment cost at lifespan boundaries
    let redeployment = 0;
    if (
      investment.toolLifespanMonths > 0 &&
      month > 1 &&
      (month - 1) % investment.toolLifespanMonths === 0
    ) {
      redeployment = calcRedeploymentCost(investment);
    }

    const adoption = linearAdoption(month, savings.adoptionRampMonths) * utilization;
    const monthlySavings = perUnitRate * units * adoption;
    const monthlyInvestmentCost = investment.monthlyRecurringCost + redeployment;

    cumulativeSavings += monthlySavings;
    cumulativeInvestment += monthlyInvestmentCost;
    const netPosition = cumulativeSavings - cumulativeInvestment;

    if (breakEvenMonth === null && netPosition > 0) {
      breakEvenMonth = month;
    }

    monthlyBreakdowns.push({
      month,
      adoptionRate: adoption,
      monthlySavings,
      monthlyInvestmentCost,
      cumulativeSavings,
      cumulativeInvestment,
      netPosition,
    });
  }

  const lastMonth = monthlyBreakdowns[monthlyBreakdowns.length - 1];
  const threeYearNetSavings = lastMonth?.netPosition ?? 0;
  const totalInvestment = lastMonth?.cumulativeInvestment ?? upfront;

  // Year 1 ROI
  const month12 = monthlyBreakdowns[Math.min(11, monthlyBreakdowns.length - 1)];
  const year1Investment = month12?.cumulativeInvestment ?? upfront;
  const year1ROI = month12 && year1Investment > 0
    ? (month12.netPosition / year1Investment) * 100
    : 0;

  // Savings at full adoption
  const monthlySavingsAtFullAdoption = perUnitRate * units * utilization;

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
    savingsPerUnit: perUnitRate,
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
  costLocked?: boolean,
): FormulaDisplay[] {
  const { savings, investment } = inputs;
  const perUnitRate = computeSavingsPerUnit(savings);
  const units = Math.max(1, savings.referenceUnits);
  const utilization = savings.utilizationPercent;
  const monthlySavings = perUnitRate * units * utilization;

  const upfrontCost = calcUpfrontCost(investment);
  const oneTimeInvestment = upfrontCost + investment.trainingCost + investment.deploymentCost;

  const formulas: FormulaDisplay[] = [];

  // ── Savings derivation ──
  if (savings.mode === 'time-based') {
    const currentCostPerUnit =
      (savings.currentCrewSize * savings.currentTimePerUnit / 60) * savings.hourlyRate;
    const proposedCostPerUnit =
      (savings.proposedCrewSize * savings.proposedTimePerUnit / 60) * savings.hourlyRate;

    formulas.push(
      {
        id: 'current-cost-per-unit',
        label: `Current Cost per ${savings.unitName}`,
        formula: 'crew_size x time_per_unit x hourly_rate / 60',
        substituted: `${savings.currentCrewSize} x ${formatNumber(savings.currentTimePerUnit)} min x ${formatCurrency(savings.hourlyRate)} / 60`,
        result: formatCurrencyDecimals(currentCostPerUnit),
      },
      {
        id: 'proposed-cost-per-unit',
        label: `Proposed Cost per ${savings.unitName}`,
        formula: 'crew_size x time_per_unit x hourly_rate / 60',
        substituted: `${savings.proposedCrewSize} x ${formatNumber(savings.proposedTimePerUnit)} min x ${formatCurrency(savings.hourlyRate)} / 60`,
        result: formatCurrencyDecimals(proposedCostPerUnit),
      },
      {
        id: 'labor-savings-per-unit',
        label: `Labor Savings per ${savings.unitName}`,
        formula: 'current_cost - proposed_cost',
        substituted: `${formatCurrencyDecimals(currentCostPerUnit)} - ${formatCurrencyDecimals(proposedCostPerUnit)}`,
        result: formatCurrencyDecimals(Math.max(0, currentCostPerUnit - proposedCostPerUnit)),
      },
    );

    if (savings.currentTimePerUnit > 0) {
      const timeSavingsPercent = 1 - savings.proposedTimePerUnit / savings.currentTimePerUnit;
      formulas.push({
        id: 'time-savings-pct',
        label: 'Time Savings',
        formula: '1 - proposed_time / current_time',
        substituted: `1 - ${formatNumber(savings.proposedTimePerUnit)} / ${formatNumber(savings.currentTimePerUnit)}`,
        result: formatPercent(Math.max(0, timeSavingsPercent)),
      });
    }

    if (savings.currentCrewSize > savings.proposedCrewSize) {
      formulas.push({
        id: 'crew-reduction',
        label: 'Crew Reduction',
        formula: 'current_crew - proposed_crew',
        substituted: `${savings.currentCrewSize} - ${savings.proposedCrewSize}`,
        result: `${savings.currentCrewSize - savings.proposedCrewSize} worker(s)`,
      });
    }
  } else {
    formulas.push({
      id: 'direct-savings-per-unit',
      label: `Direct Savings per ${savings.unitName}`,
      formula: 'direct_savings_per_unit',
      substituted: `${formatCurrencyDecimals(savings.directSavingsPerUnit)} / ${savings.unitName}`,
      result: formatCurrencyDecimals(savings.directSavingsPerUnit),
    });
  }

  // Additional savings
  if (savings.additionalSavingsPerUnit > 0) {
    formulas.push({
      id: 'additional-savings',
      label: `Additional Savings per ${savings.unitName}`,
      formula: 'additional_savings_per_unit',
      substituted: `${formatCurrencyDecimals(savings.additionalSavingsPerUnit)} / ${savings.unitName}`,
      result: formatCurrencyDecimals(savings.additionalSavingsPerUnit),
    });
  }

  // Total savings per unit
  formulas.push({
    id: 'total-savings-per-unit',
    label: `Total Savings per ${savings.unitName}`,
    formula: savings.mode === 'time-based'
      ? 'max(0, labor_savings + additional_savings)'
      : 'max(0, direct_savings + additional_savings)',
    substituted: savings.additionalSavingsPerUnit > 0
      ? `max(0, ${formatCurrencyDecimals(perUnitRate - savings.additionalSavingsPerUnit)} + ${formatCurrencyDecimals(savings.additionalSavingsPerUnit)})`
      : formatCurrencyDecimals(perUnitRate),
    result: `${formatCurrencyDecimals(perUnitRate)} / ${savings.unitName}`,
  });

  // Monthly savings at full adoption
  formulas.push({
    id: 'monthly-savings',
    label: 'Monthly Savings (Full Adoption)',
    formula: 'savings_per_unit x reference_units x utilization',
    substituted: `${formatCurrencyDecimals(perUnitRate)} x ${formatNumber(units)} x ${formatPercent(utilization)}`,
    result: formatCurrency(monthlySavings),
  });

  // Investment formulas
  formulas.push({
    id: 'one-time-investment',
    label: 'One-Time Investment',
    formula: 'assembly + design + controls + training + deployment',
    substituted: costLocked
      ? `*** + *** + *** + ${formatCurrency(investment.trainingCost)} + ${formatCurrency(investment.deploymentCost)}`
      : `${formatCurrency(investment.assemblyCost)} + ${formatCurrency(investment.designCost)} + ${formatCurrency(investment.controlsCost)} + ${formatCurrency(investment.trainingCost)} + ${formatCurrency(investment.deploymentCost)}`,
    result: formatCurrency(oneTimeInvestment),
  });

  // Redeployment formula card when lifespan is set
  if (investment.toolLifespanMonths > 0) {
    const redeploymentCost = calcRedeploymentCost(investment);
    const redeployments = Math.floor(analysisPeriod / investment.toolLifespanMonths);
    formulas.push({
      id: 'redeployment',
      label: 'Redeployment Cost',
      formula: '(assembly + design + controls + deployment) x floor(period / lifespan)',
      substituted: costLocked
        ? `*** x floor(${analysisPeriod} / ${investment.toolLifespanMonths})`
        : `${formatCurrency(redeploymentCost)} x floor(${analysisPeriod} / ${investment.toolLifespanMonths})`,
      result: `${redeployments} cycle(s) = ${formatCurrency(redeploymentCost * redeployments)}`,
    });
  }

  formulas.push(
    {
      id: 'adoption-rate',
      label: 'Adoption Rate (month t)',
      formula: 'min(1, t / adoption_period)',
      substituted: `min(1, t / ${savings.adoptionRampMonths})`,
      result: `Linear ramp over ${savings.adoptionRampMonths} months`,
    },
    {
      id: 'roi-formula',
      label: 'ROI %',
      formula: '(net_position / cumulative_investment) x 100',
      substituted: '(cumulative_savings - cumulative_investment) / cumulative_investment x 100',
      result: 'Applied at Year 1 and end of analysis period',
    },
  );

  return formulas;
}
