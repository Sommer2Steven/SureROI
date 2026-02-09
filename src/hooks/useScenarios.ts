import { useReducer } from 'react';
import type { AppState, AppAction } from '../types';
import {
  createDefaultScenario,
  DEFAULT_CURRENT_STATE,
  DEFAULT_ANALYSIS_PERIOD,
  SCENARIO_COLORS,
  MAX_SCENARIOS,
} from '../constants/defaults';

const firstScenario = createDefaultScenario(0);

const initialState: AppState = {
  currentState: { ...DEFAULT_CURRENT_STATE },
  analysisPeriod: DEFAULT_ANALYSIS_PERIOD,
  scenarios: [firstScenario],
  activeScenarioId: firstScenario.id,
  chartView: 'cumulative',
  showBreakdown: false,
  showMonthlyTable: false,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_SCENARIO': {
      if (state.scenarios.length >= MAX_SCENARIOS) return state;
      const newScenario = createDefaultScenario(state.scenarios.length);
      return {
        ...state,
        scenarios: [...state.scenarios, newScenario],
        activeScenarioId: newScenario.id,
      };
    }

    case 'REMOVE_SCENARIO': {
      if (state.scenarios.length <= 1) return state;
      const remaining = state.scenarios.filter((s) => s.id !== action.id);
      const activeId =
        state.activeScenarioId === action.id
          ? remaining[0].id
          : state.activeScenarioId;
      return {
        ...state,
        scenarios: remaining,
        activeScenarioId: activeId,
      };
    }

    case 'UPDATE_SCENARIO': {
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.id ? { ...s, ...action.updates } : s
        ),
      };
    }

    case 'UPDATE_CURRENT_STATE': {
      return {
        ...state,
        currentState: { ...state.currentState, ...action.updates },
      };
    }

    case 'UPDATE_INVESTMENT': {
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.id
            ? { ...s, investment: { ...s.investment, ...action.updates } }
            : s
        ),
      };
    }

    case 'UPDATE_EFFICIENCY': {
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.id
            ? { ...s, efficiency: { ...s.efficiency, ...action.updates } }
            : s
        ),
      };
    }

    case 'UPDATE_ANALYSIS_PERIOD': {
      return {
        ...state,
        analysisPeriod: action.period,
      };
    }

    case 'DUPLICATE_SCENARIO': {
      if (state.scenarios.length >= MAX_SCENARIOS) return state;
      const source = state.scenarios.find((s) => s.id === action.id);
      if (!source) return state;
      const newIndex = state.scenarios.length;
      const dup = createDefaultScenario(newIndex);
      const duplicated = {
        ...source,
        id: dup.id,
        name: `${source.name} (Copy)`,
        color: SCENARIO_COLORS[newIndex % SCENARIO_COLORS.length],
      };
      return {
        ...state,
        scenarios: [...state.scenarios, duplicated],
        activeScenarioId: duplicated.id,
      };
    }

    case 'SET_ACTIVE': {
      return { ...state, activeScenarioId: action.id };
    }

    case 'SET_CHART_VIEW': {
      return { ...state, chartView: action.view };
    }

    case 'TOGGLE_BREAKDOWN': {
      return { ...state, showBreakdown: !state.showBreakdown };
    }

    case 'TOGGLE_MONTHLY_TABLE': {
      return { ...state, showMonthlyTable: !state.showMonthlyTable };
    }

    default:
      return state;
  }
}

export function useScenarios() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}
