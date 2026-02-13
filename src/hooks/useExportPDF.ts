/**
 * hooks/useExportPDF.ts
 *
 * Generates a structured PDF report with:
 *   1. Title + all 3 charts (cumulative, monthly, compare)
 *   2. KPI summary per proposed scenario
 *   3. Input details per scenario
 *   4. Calculation breakdown per scenario
 *
 * Cycles through chart views during export to capture each one.
 */

import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import type { ScenarioInputs, ScenarioResults, CurrentStateInputs, ChartView, AppAction } from '../types';
import { getFormulaDisplays } from '../calculations/engine';
import {
  formatCurrency,
  formatPercent,
  formatCurrencyK,
} from '../constants/formatting';

interface ExportPDFParams {
  projectTitle: string;
  projectDescription: string;
  scenarios: ScenarioInputs[];
  results: ScenarioResults[];
  analysisPeriod: number;
  chartView: ChartView;
  dispatch: React.Dispatch<AppAction>;
}

const PAGE_W = 841.89; // A4 landscape width in points
const PAGE_H = 595.28; // A4 landscape height in points
const MARGIN = 40;
const COL_W = (PAGE_W - MARGIN * 2);

/** Waits for the next repaint so React has time to render the new chart view */
function waitForRender(ms: number = 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Waits until the chart SVG has rendered path/rect elements (actual data lines/bars) */
function waitForChartReady(container: HTMLElement, timeoutMs: number = 3000): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now();
    function check() {
      const svg = container.querySelector('.recharts-surface');
      const hasLines = container.querySelectorAll('.recharts-line-curve, .recharts-bar-rectangle, .recharts-curve').length > 0;
      if (svg && hasLines) {
        // Extra wait for animations to settle
        setTimeout(resolve, 400);
      } else if (Date.now() - start > timeoutMs) {
        // Fallback: resolve anyway after timeout
        resolve();
      } else {
        requestAnimationFrame(check);
      }
    }
    check();
  });
}

/** Captures the chart container element as a canvas */
async function captureChart(): Promise<HTMLCanvasElement | null> {
  const chartEl = document.querySelector('.bg-card') as HTMLElement;
  if (!chartEl) return null;

  // Block pointer events and hide any active tooltip before capture
  chartEl.style.pointerEvents = 'none';
  const tooltips = chartEl.querySelectorAll<HTMLElement>('.recharts-tooltip-wrapper');
  tooltips.forEach((t) => { t.style.visibility = 'hidden'; t.style.opacity = '0'; });

  // Wait for chart SVG to be fully rendered with data
  await waitForChartReady(chartEl);

  // Read the computed background color from CSS custom properties for current mode
  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#ffffff';

  const canvas = await html2canvas(chartEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: bgColor,
  });

  // Restore pointer events (tooltips will re-appear naturally on next hover)
  chartEl.style.pointerEvents = '';

  return canvas;
}

export function useExportPDF(params: ExportPDFParams) {
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const { projectTitle, projectDescription, scenarios, results, analysisPeriod, chartView, dispatch } = params;
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

      // ── Helper: add chart image to PDF ──
      function addChartImage(canvas: HTMLCanvasElement, title: string) {
        const imgData = canvas.toDataURL('image/png');
        const imgW = COL_W;
        const imgH = (canvas.height / canvas.width) * imgW;
        const maxH = PAGE_H - y - MARGIN - 20;
        const finalH = Math.min(imgH, maxH);
        const finalW = (finalH / imgH) * imgW;

        // Chart label
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 60, 60);
        pdf.text(title, MARGIN, y);
        y += 14;

        pdf.addImage(imgData, 'PNG', MARGIN, y, finalW, finalH);
        y += finalH + 12;
      }

      // ══════════════════════════════════════════════════════════════
      // PAGE 1: Title + Cumulative Chart
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
      y += 20;

      // ── Capture all 3 charts by cycling views ──
      const chartViews: { view: ChartView; title: string }[] = [
        { view: 'cumulative', title: 'Cumulative Cost Over Time' },
        { view: 'monthly', title: 'Monthly Savings' },
        { view: 'compare', title: 'Scenario Comparison — Net Position' },
      ];

      for (const { view, title } of chartViews) {
        dispatch({ type: 'SET_CHART_VIEW', view });
        // Wait for React to mount the new chart component before checking readiness
        await waitForRender(100);

        const canvas = await captureChart();
        if (canvas) {
          checkPage(300);
          addChartImage(canvas, title);
        }

        // Monthly and Compare go on new pages
        if (view === 'cumulative' || view === 'monthly') {
          pdf.addPage();
          y = MARGIN;
        }
      }

      // Restore original chart view
      dispatch({ type: 'SET_CHART_VIEW', view: chartView });

      // ══════════════════════════════════════════════════════════════
      // KPI Summary (proposed scenarios)
      // ══════════════════════════════════════════════════════════════
      const proposedResults = results.slice(1);
      if (proposedResults.length > 0) {
        pdf.addPage();
        y = MARGIN;
        sectionHeader('KPI Summary');

        // Table header
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 100, 100);
        const cols = [MARGIN + 8, MARGIN + 180, MARGIN + 290, MARGIN + 400, MARGIN + 510, MARGIN + 620];
        const headers = ['Scenario', 'Break-even', 'Year 1 ROI', 'Net Savings', 'Investment', 'Mo. Savings'];
        headers.forEach((h, i) => pdf.text(h, cols[i], y));
        y += 4;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(MARGIN + 8, y, MARGIN + COL_W - 8, y);
        y += 10;

        proposedResults.forEach((r) => {
          checkPage(16);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 30, 30);
          pdf.text(r.scenarioName, cols[0], y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(r.breakEvenMonth ? `Month ${r.breakEvenMonth}` : 'N/A', cols[1], y);
          pdf.text(`${r.year1ROI.toFixed(0)}%`, cols[2], y);
          pdf.text(formatCurrencyK(r.threeYearNetSavings), cols[3], y);
          pdf.text(formatCurrencyK(r.totalInvestment), cols[4], y);
          pdf.text(formatCurrencyK(r.monthlySavingsAtFullAdoption), cols[5], y);
          y += 14;
        });
        y += 8;
      }

      // ══════════════════════════════════════════════════════════════
      // Scenario Inputs + Calculations
      // ══════════════════════════════════════════════════════════════
      const baseline = scenarios[0];

      // Global analysis period — show once at the top of the inputs section
      pdf.addPage();
      y = MARGIN;
      sectionHeader('Analysis Period');
      tableRow('Months', String(analysisPeriod));
      y += 6;

      scenarios.forEach((s, idx) => {
        const isBaseline = idx === 0;
        pdf.addPage();
        y = MARGIN;

        sectionHeader(`${s.name}${isBaseline ? ' (Baseline)' : ''} — Inputs`);

        // Current State
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 60, 60);
        pdf.text('Current State', MARGIN + 4, y);
        y += 14;
        tableRow('Field Workers', String(s.currentState.workers));
        tableRow('Hourly Rate', formatCurrency(s.currentState.hourlyRate));
        tableRow('Hours/Week', String(s.currentState.hoursPerWeek));
        tableRow('Error/Rework Rate', formatPercent(s.currentState.errorRate));
        tableRow('Monthly Ops Costs', formatCurrency(s.currentState.monthlyOperationalCosts));
        y += 6;

        // Investment
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 60, 60);
        pdf.text(isBaseline ? 'Current Tool Investment' : 'New Tool Investment', MARGIN + 4, y);
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

        // Utilization (shown for both baseline and proposed)
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 60, 60);
        pdf.text(isBaseline ? 'Utilization' : 'Efficiency Gains', MARGIN + 4, y);
        y += 14;
        tableRow('Utilization', formatPercent(s.efficiency.utilizationPercent));

        if (!isBaseline) {
          tableRow('Time Savings', formatPercent(s.efficiency.timeSavings));
          tableRow('Error Reduction', formatPercent(s.efficiency.errorReduction));
          tableRow('Adoption Ramp', `${s.efficiency.adoptionRampMonths} months`);
          tableRow("Add'l Revenue/mo", formatCurrency(s.efficiency.additionalMonthlyRevenue));
        }
        y += 6;

        if (!isBaseline) {
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
        }

        // ── Calculations for this scenario ──
        const result = results.find((r) => r.scenarioId === s.id);
        if (result) {
          checkPage(30);
          sectionHeader(`${s.name} — Calculations`);

          const baselineState: CurrentStateInputs | undefined = !isBaseline ? baseline.currentState : undefined;
          const formulas = getFormulaDisplays(s, analysisPeriod, baselineState, s.costBreakdownLocked);

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
