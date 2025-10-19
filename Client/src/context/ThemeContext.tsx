import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    isDarkMode: boolean;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
        if (stored === 'light' || stored === 'dark') return stored;
        const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    const value = useMemo<ThemeContextValue>(() => ({
        theme,
        isDarkMode: theme === 'dark',
        toggleTheme: () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
        setTheme: (t: Theme) => setThemeState(t),
    }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};



