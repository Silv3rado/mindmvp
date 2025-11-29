import React, { createContext, useContext } from 'react';

interface ThemeContextType {
  effectiveTheme: 'light';
}

const ThemeContext = createContext<ThemeContextType>({
  effectiveTheme: 'light',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ effectiveTheme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
