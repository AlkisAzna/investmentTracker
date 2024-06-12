import React, { createContext, useReducer, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

// Provide initial context value
const defaultState = { darkMode: false };

// Create context with default value and dispatch function
export const ThemeContext = createContext({
  state: defaultState,
  dispatch: () => null
});

export function ThemeWorker({ children }) {
  // Use useMediaQuery to check for the user's preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const initialState = {
    darkMode: prefersDarkMode,
  };

  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'LIGHTMODE':
        return { darkMode: false };
      case 'DARKMODE':
        return { darkMode: true };
      default:
        return state;
    }
  }, initialState);

  // Use useEffect to update state when prefersDarkMode changes
  useEffect(() => {
    dispatch({ type: prefersDarkMode ? 'DARKMODE' : 'LIGHTMODE' });
  }, [prefersDarkMode]);

  return <ThemeContext.Provider value={{ state, dispatch }}>{children}</ThemeContext.Provider>;
}
