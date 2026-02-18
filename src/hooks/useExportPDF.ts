/**
 * hooks/useExportPDF.ts
 *
 * Generates a structured PDF report with:
 *   1. Title + Unit Economics summary
 *   2. KPI summary per scenario
 *   3. Input details per scenario
 *   4. Calculation breakdown per scenario
 */

import { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import type { ScenarioInputs, ScenarioResults } from '../types';
import { computeSavingsPerUnit, getFormulaDisplays } from '../calculations/engine';
import {
  formatCurrency,
  formatCurrencyDecimals,
  formatPercent,
  formatCurrencyK,
  formatNumber,
} from '../constants/formatting';

interface ExportPDFParams {
  projectTitle: string;
  projectDescription: string;
  scenarios: ScenarioInputs[];
  results: ScenarioResults[];
  analysisPeriod: number;
}

const PAGE_W = 841.89; // A4 landscape width in points
const PAGE_H = 595.28; // A4 landscape height in points
const MARGIN = 40;
const COL_W = (PAGE_W - MARGIN * 2);

export function useExportPDF(params: ExportPDFParams) {
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const { projectTitle, projectDescription, scenarios, results, analysisPeriod } = params;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

      let y = MARGIN;

      // ── Helper: add new page if needed ──
      function checkPage(needed: number) {
        if (y + needed > PAGE_H - MARGIN) {
          pdf.addPage();
          y = MARGIN;
        }
      }

      // ── Helper: section header ──
      function sectionHeader(title: string) {
        checkPage(30);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text(title, MARGIN, y);
        y += 6;
        pdf.setDrawColor(59, 130, 246);
        pdf.setLineWidth(1.5);
        pdf.line(MARGIN, y, MARGIN + COL_W, y);
        y += 14;
      }

      // ── Helper: table row ──
      function tableRow(label: string, value: string) {
        checkPage(16);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text(label, MARGIN + 8, y);
        pdf.setTextColor(30, 30, 30);
        pdf.setFont('helvetica', 'bold');
        pdf.text(value, MARGIN + 280, y);
        y += 14;
      }

      // ══════════════════════════════════════════════════════════════
      // PAGE 1: Title + Unit Economics
      // ══════════════════════════════════════════════════════════════

      // Title
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 30);
      pdf.text(projectTitle || 'SureROI Report', MARGIN, y + 4);
      y += 16;

      if (projectDescription) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(projectDescription, MARGIN, y + 4);
        y += 16;
      }

      // Date
      pdf.setFontSize(9);
      pdf.setTextColor(140, 140, 140);
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, MARGIN, y);
      y += 24;

      // ── Unit Economics Table ──
      if (results.length > 0) {
        sectionHeader('Unit Economics');

        // Table header
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 100, 100);
        const ueCols = [MARGIN + 8, MARGIN + 180, MARGIN + 360, MARGIN + 520];
        const ueHeaders = ['Scenario', 'Savings / Unit', 'Total Investment', 'Break-Even Units'];
        ueHeaders.forEach((h, i) => pdf.text(h, ueCols[i], y));
        y += 4;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(MARGIN + 8, y, MARGIN + COL_W - 8, y);
        y += 10;

        results.forEach((r) => {
          checkPage(16);
          const scenario = scenarios.find((s) => s.id === r.scenarioId);
          const unitName = scenario?.savings.unitName || 'unit';
          const breakEvenUnits = r.savingsPerUnit > 0 ? r.totalInvestment / r.savingsPerUnit : null;

          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 30, 30);
          pdf.text(r.scenarioName, ueCols[0], y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${formatCurrencyDecimals(r.savingsPerUnit)} /${unitName}/mo`, ueCols[1], y);
          pdf.text(formatCurrencyK(r.totalInvestment), ueCols[2], y);
          pdf.text(breakEvenUnits !== null ? `${formatNumber(breakEvenUnits)} ${unitName}s` : 'N/A', ueCols[3], y);
          y += 14;
        });
        y += 8;
      }

      // ══════════════════════════════════════════════════════════════
      // KPI Summary
      // ══════════════════════════════════════════════════════════════
      if (results.length > 0) {
        pdf.addPage();
        y = MARGIN;
        sectionHeader('KPI Summary');

        // Table header
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 100, 100);
        const cols = [MARGIN + 8, MARGIN + 160, MARGIN + 260, MARGIN + 360, MARGIN + 460, MARGIN + 540, MARGIN + 640];
        const headers = ['Scenario', 'Break-even', 'Year 1 ROI', 'Net Savings', '$/Unit', 'Investment', 'Mo. Savings'];
        headers.forEach((h, i) => pdf.text(h, cols[i], y));
        y += 4;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(MARGIN + 8, y, MARGIN + COL_W - 8, y);
        y += 10;

        results.forEach((r) => {
          checkPage(16);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 30, 30);
          pdf.text(r.scenarioName, cols[0], y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(r.breakEvenMonth ? `Month ${r.breakEvenMonth}` : 'N/A', cols[1], y);
          pdf.text(`${r.year1ROI.toFixed(0)}%`, cols[2], y);
          pdf.text(formatCurrencyK(r.threeYearNetSavings), cols[3], y);
          pdf.text(formatCurrencyDecimals(r.savingsPerUnit), cols[4], y);
          pdf.text(formatCurrencyK(r.totalInvestment), cols[5], y);
          pdf.text(formatCurrencyK(r.monthlySavingsAtFullAdoption), cols[6], y);
          y += 14;
        });
        y += 8;
      }

      // ══════════════════════════════════════════════════════════════
      // Scenario Inputs + Calculations
      // ══════════════════════════════════════════════════════════════

      // Global analysis period
      pdf.addPage();
      y = MARGIN;
      sectionHeader('Analysis Period');
      tableRow('Months', String(analysisPeriod));
      y += 6;

      scenarios.forEach((s) => {
        pdf.addPage();
        y = MARGIN;

        sectionHeader(`${s.name} — Inputs`);

        // Savings
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 60, 60);
        pdf.text('Savings', MARGIN + 4, y);
        y += 14;
        tableRow('Mode', s.savings.mode === 'direct' ? 'Direct Rate' : 'Time-Based');
        tableRow('Unit Name', s.savings.unitName);
        tableRow('Reference Units', formatNumber(s.savings.referenceUnits));

        if (s.savings.mode === 'direct') {
          tableRow('Savings/Unit/Mo', formatCurrencyDecimals(s.savings.directSavingsPerUnit));
        } else {
          tableRow('Hourly Rate', formatCurrency(s.savings.hourlyRate));
          tableRow('Current Crew Size', String(s.savings.currentCrewSize));
          tableRow('Current Time/Unit', `${formatNumber(s.savings.currentTimePerUnit)} min`);
          tableRow('Proposed Crew Size', String(s.savings.proposedCrewSize));
          tableRow('Proposed Time/Unit', `${formatNumber(s.savings.proposedTimePerUnit)} min`);
          const perUnit = computeSavingsPerUnit(s.savings);
          tableRow('Computed Savings/Unit', formatCurrencyDecimals(perUnit));
        }

        if (s.savings.additionalSavingsPerUnit > 0) {
          tableRow("Add'l Savings/Unit", formatCurrencyDecimals(s.savings.additionalSavingsPerUnit));
        }
        tableRow('Utilization', formatPercent(s.savings.utilizationPercent));
        tableRow('Adoption Ramp', `${s.savings.adoptionRampMonths} months`);
        y += 6;

        // Investment
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 60, 60);
        pdf.text('Investment', MARGIN + 4, y);
        y += 14;
        const totalUpfront = s.investment.assemblyCost + s.investment.designCost + s.investment.controlsCost;
        if (s.costBreakdownLocked) {
          tableRow('Assembly Cost', '* * *');
          tableRow('Design Cost', '* * *');
          tableRow('Controls Cost', '* * *');
        } else {
          tableRow('Assembly Cost', formatCurrency(s.investment.assemblyCost));
          tableRow('Design Cost', formatCurrency(s.investment.designCost));
          tableRow('Controls Cost', formatCurrency(s.investment.controlsCost));
        }
        tableRow('Total Upfront', formatCurrency(totalUpfront));
        tableRow('Monthly Recurring', formatCurrency(s.investment.monthlyRecurringCost));
        tableRow('Training Cost', formatCurrency(s.investment.trainingCost));
        tableRow('Deployment Cost', formatCurrency(s.investment.deploymentCost));
        if (s.investment.toolLifespanMonths > 0) {
          tableRow('Tool Lifespan', `${s.investment.toolLifespanMonths} months`);
        }
        y += 6;

        // Qualitative
        const flags: string[] = [];
        if (s.qualitative.safetyCritical) flags.push('Safety-Critical');
        if (s.qualitative.qualityCritical) flags.push('Quality-Critical');
        if (s.qualitative.operationsCritical) flags.push('Operations-Critical');
        if (flags.length > 0) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(60, 60, 60);
          pdf.text('Qualitative Flags', MARGIN + 4, y);
          y += 14;
          tableRow('Active Flags', flags.join(', '));
          y += 6;
        }

        // ── Calculations for this scenario ──
        const result = results.find((r) => r.scenarioId === s.id);
        if (result) {
          checkPage(30);
          sectionHeader(`${s.name} — Calculations`);

          const formulas = getFormulaDisplays(s, analysisPeriod, s.costBreakdownLocked);

          formulas.forEach((f) => {
            checkPage(42);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(40, 40, 40);
            pdf.text(f.label, MARGIN + 8, y);
            y += 12;

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.setFontSize(8);
            pdf.text(`Formula: ${f.formula}`, MARGIN + 16, y);
            y += 11;
            pdf.text(`Values:  ${f.substituted}`, MARGIN + 16, y);
            y += 11;

            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 30, 30);
            pdf.setFontSize(9);
            pdf.text(`Result:  ${f.result}`, MARGIN + 16, y);
            y += 14;
          });
        }
      });

      // ── Save ──
      const filename = projectTitle.trim() || 'SureROI-Report';
      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [params]);

  return { exportPDF, isExporting };
}
