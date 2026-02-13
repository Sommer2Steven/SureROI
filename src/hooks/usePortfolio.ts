/**
 * hooks/usePortfolio.ts
 *
 * State management for the portfolio dashboard.
 * Manages a list of PortfolioEntry objects, department salary, and metadata.
 */

import { useReducer } from 'react';
import type { PortfolioState, PortfolioAction } from '../types';

const initialState: PortfolioState = {
  entries: [],
  departmentAnnualSalary: 0,
  portfolioName: '',
  portfolioDescription: '',
};

function reducer(state: PortfolioState, action: PortfolioAction): PortfolioState {
  switch (action.type) {
    case 'ADD_ENTRY':
      return { ...state, entries: [...state.entries, action.entry] };

    case 'REMOVE_ENTRY':
      return { ...state, entries: state.entries.filter((e) => e.id !== action.id) };

    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.id ? { ...e, ...action.updates } : e
        ),
      };

    case 'SET_DEPARTMENT_SALARY':
      return { ...state, departmentAnnualSalary: action.salary };

    case 'SET_PORTFOLIO_NAME':
      return { ...state, portfolioName: action.name };

    case 'SET_PORTFOLIO_DESCRIPTION':
      return { ...state, portfolioDescription: action.description };

    case 'LOAD_PORTFOLIO':
      return {
        entries: action.portfolio.entries,
        departmentAnnualSalary: action.portfolio.departmentAnnualSalary,
        portfolioName: action.portfolio.portfolioName,
        portfolioDescription: action.portfolio.portfolioDescription,
      };

    case 'RESET_PORTFOLIO':
      return initialState;

    default:
      return state;
  }
}

export function usePortfolio() {
  const [portfolioState, portfolioDispatch] = useReducer(reducer, initialState);
  return { portfolioState, portfolioDispatch };
}
