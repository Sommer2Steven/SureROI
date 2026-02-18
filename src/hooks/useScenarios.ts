/**
 * hooks/useScenarios.ts
 *
 * Central state management hook for the entire application.
 * Uses React's useReducer to manage all app state in one place.
 */

import { useReducer } from 'react';
import type { AppState, AppAction, ProjectFile } from '../types';
import {
  createDefaultScenario,
  SCENARIO_COLORS,
  MAX_SCENARIOS,
} from '../constants/defaults';

const firstScenario = createDefaultScenario(0);

const initialState: AppState = {
  scenarios: [firstScenario],
  activeScenarioId: firstScenario.id,
  analysisPeriod: 36,
  showBreakdown: false,
  showMonthlyTable: false,
  projectTitle: '',
  projectDescription: '',
  sidebarCollapsed: false,
  darkMode: true,
  appMode: 'project',
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

    case 'UPDATE_SAVINGS': {
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.id
            ? { ...s, savings: { ...s.savings, ...action.updates } }
            : s
        ),
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

    case 'UPDATE_ANALYSIS_PERIOD': {
      return { ...state, analysisPeriod: action.period };
    }

    case 'UPDATE_QUALITATIVE': {
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.id
            ? { ...s, qualitative: { ...s.qualitative, ...action.updates } }
            : s
        ),
      };
    }

    case 'RENAME_SCENARIO': {
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.id ? { ...s, name: action.name } : s
        ),
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

    case 'TOGGLE_BREAKDOWN': {
      return { ...state, showBreakdown: !state.showBreakdown };
    }

    case 'TOGGLE_MONTHLY_TABLE': {
      return { ...state, showMonthlyTable: !state.showMonthlyTable };
    }

    case 'SET_PROJECT_TITLE': {
      return { ...state, projectTitle: action.title };
    }

    case 'SET_PROJECT_DESCRIPTION': {
      return { ...state, projectDescription: action.description };
    }

    case 'TOGGLE_SIDEBAR': {
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    }

    case 'TOGGLE_DARK_MODE': {
      return { ...state, darkMode: !state.darkMode };
    }

    case 'SET_APP_MODE': {
      return { ...state, appMode: action.mode };
    }

    case 'RESET_PROJECT': {
      const fresh = createDefaultScenario(0);
      return {
        ...initialState,
        darkMode: state.darkMode,
        sidebarCollapsed: state.sidebarCollapsed,
        appMode: state.appMode,
        scenarios: [fresh],
        activeScenarioId: fresh.id,
      };
    }

    case 'LOAD_PROJECT': {
      const p = action.project;
      return {
        ...state,
        projectTitle: p.projectTitle,
        projectDescription: p.projectDescription,
        analysisPeriod: p.analysisPeriod,
        darkMode: p.darkMode,
        scenarios: p.scenarios,
        activeScenarioId: p.scenarios[0]?.id ?? state.activeScenarioId,
        // Reset transient UI state
        showBreakdown: false,
        showMonthlyTable: false,
        sidebarCollapsed: false,
      };
    }

    default:
      return state;
  }
}

export function useScenarios() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}
