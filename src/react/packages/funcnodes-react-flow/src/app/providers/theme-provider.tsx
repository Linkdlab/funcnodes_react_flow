import * as React from "react";

/**
 * Configuration object for theme settings
 * @interface Theme
 */
interface Theme {
  /** The current color theme identifier */
  colorTheme: string;
}

/**
 * Context value interface for theme management
 * @interface ThemeContextValue
 */
interface ThemeContextValue {
  /** The currently active color theme */
  colorTheme: string;
  /**
   * Sets the color theme persistently (saves to localStorage)
   * @param theme - The theme identifier to set
   * @throws {Error} When theme is not in available themes
   */
  setColorTheme: (theme: string) => void;
  /**
   * Previews a color theme temporarily (no localStorage persistence)
   * @param theme - The theme identifier to preview
   * @throws {Error} When theme is not in available themes
   */
  previewColorTheme: (theme: string) => void;
}

/**
 * Props interface for the ThemeProvider component
 * @interface ThemeProviderProps
 */
interface ThemeProviderProps {
  /** Array of available theme identifiers */
  available_themes: string[];
  /** Optional default theme identifier. Falls back to first available theme if not provided */
  default_theme?: string;
  /** React children to wrap with theme context */
  children: React.ReactNode;
}

/**
 * React context for theme management
 * Provides access to current theme and theme switching functions
 */
const ThemeContext = React.createContext<ThemeContextValue>({
  colorTheme: "classic",
  setColorTheme: () => {},
  previewColorTheme: () => {},
});

/**
 * ThemeProvider component that manages application theming
 *
 * This component provides theme management functionality including:
 * - Persistent theme storage in localStorage
 * - Temporary theme previewing
 * - Automatic DOM attribute updates
 * - Theme validation and fallback handling
 *
 * @component
 * @param props - The theme provider configuration
 * @returns JSX element that wraps children with theme context
 *
 * @example
 * ```tsx
 * <ThemeProvider
 *   available_themes={["light", "dark", "auto"]}
 *   default_theme="light"
 * >
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  available_themes,
  children,
  default_theme,
}) => {
  // Convert to Set for O(1) lookups and memoize to prevent unnecessary re-renders
  const available_themes_set = React.useMemo(
    () => new Set(available_themes),
    [available_themes]
  );

  const [colorTheme, _setColorTheme] = React.useState<string>(
    default_theme ?? available_themes[0]
  );

  /**
   * Sets the color theme persistently by saving to localStorage
   * @param theme - The theme identifier to set
   * @throws {Error} When the theme is not in the available themes list
   */
  const setColorTheme = React.useCallback(
    (theme: string) => {
      if (!available_themes_set.has(theme)) {
        throw new Error(
          `Theme "${theme}" is not in available_themes: [${Array.from(
            available_themes_set
          ).join(", ")}]`
        );
      }
      _setColorTheme(theme);

      const themeConfig: Theme = {
        colorTheme: theme,
      };

      try {
        localStorage.setItem("theme", JSON.stringify(themeConfig));
      } catch (error) {
        console.warn("Failed to save theme to localStorage:", error);
      }
    },
    [available_themes_set]
  );

  /**
   * Previews a color theme temporarily without persisting to localStorage
   * @param theme - The theme identifier to preview
   * @throws {Error} When the theme is not in the available themes list
   */
  const previewColorTheme = React.useCallback(
    (theme: string) => {
      if (!available_themes_set.has(theme)) {
        throw new Error(
          `Theme "${theme}" is not in available_themes: [${Array.from(
            available_themes_set
          ).join(", ")}]`
        );
      }
      _setColorTheme(theme);
    },
    [available_themes_set]
  );

  /**
   * Updates the document element's theme attribute when the color theme changes
   * This allows CSS to respond to theme changes via attribute selectors
   */
  React.useEffect(() => {
    document.documentElement.setAttribute("fn-data-color-theme", colorTheme);
  }, [colorTheme]);

  /**
   * Loads the saved theme from localStorage on component mount
   * Validates that the saved theme is still available before applying it
   */
  React.useEffect(() => {
    try {
      const savedThemeData = localStorage.getItem("theme");
      if (!savedThemeData) return;

      const savedTheme: Theme = JSON.parse(savedThemeData);
      if (
        savedTheme.colorTheme &&
        available_themes_set.has(savedTheme.colorTheme)
      ) {
        _setColorTheme(savedTheme.colorTheme);
      }
    } catch (error) {
      console.warn("Failed to load theme from localStorage:", error);
    }
  }, [available_themes_set]);

  /**
   * Handles changes to available themes and default theme
   * Ensures the current theme is still valid when themes change
   */
  React.useEffect(() => {
    // If default_theme is provided but not in available themes, fall back to first available
    if (default_theme && !available_themes_set.has(default_theme)) {
      const fallbackTheme = Array.from(available_themes_set)[0];
      if (fallbackTheme) {
        setColorTheme(fallbackTheme);
      }
    }
  }, [available_themes_set, default_theme, setColorTheme]);

  /**
   * Validates that the current theme is still available
   * Falls back to the first available theme if current theme is invalid
   */
  React.useEffect(() => {
    if (!available_themes_set.has(colorTheme)) {
      const fallbackTheme = Array.from(available_themes_set)[0];
      if (fallbackTheme) {
        setColorTheme(fallbackTheme);
      }
    }
  }, [colorTheme, available_themes_set, setColorTheme]);

  const contextValue = React.useMemo(
    () => ({
      colorTheme,
      setColorTheme,
      previewColorTheme,
    }),
    [colorTheme, setColorTheme, previewColorTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to access the theme context
 *
 * @returns The current theme context value containing theme state and setters
 * @throws {Error} When used outside of a ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { colorTheme, setColorTheme, previewColorTheme } = useTheme();
 *
 *   return (
 *     <button onClick={() => setColorTheme('dark')}>
 *       Current theme: {colorTheme}
 *     </button>
 *   );
 * }
 * ```
 */
export const useTheme = (): ThemeContextValue => {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
