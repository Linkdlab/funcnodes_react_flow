import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type ColorTheme = "classic" | "metal" | "light" | "solarized" | "midnight" | "forest" | "scientific";
// type FontTheme = "sans" | "serif";
export const AVAILABLE_COLOR_THEMES: ColorTheme[] = ["classic", "metal", "light", "solarized", "midnight", "forest", "scientific"];
// const AVAILABLE_FONT_THEMES: FontTheme[] = ["sans", "serif"];
type Theme = {
  colorTheme: ColorTheme;
  // fontTheme: FontTheme;
};
const ThemeContext = createContext<{
  colorTheme: ColorTheme;
  setColorTheme: (t: ColorTheme) => void; // persistent
  previewColorTheme: (t: ColorTheme) => void; // temporary
}>({
  colorTheme: "classic",
  setColorTheme: () => {},
  previewColorTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [colorTheme, _setColorTheme] = useState<ColorTheme>("classic");
  //   const [fontTheme, setFontTheme] = useState<FontTheme>("sans");

  // Persistent setter
  const setColorTheme = (t: ColorTheme) => {
    _setColorTheme(t);
    const savetheme: Theme = {
      colorTheme,
      // fontTheme,
    };
    localStorage.setItem("theme", JSON.stringify(savetheme));
  };

  // Temporary setter (no localStorage)
  const previewColorTheme = (t: ColorTheme) => {
    _setColorTheme(t);
  };

  useEffect(() => {
    document.documentElement.setAttribute("fn-data-color-theme", colorTheme);
    // document.documentElement.setAttribute("data-font-theme", fontTheme);
    
  }, [
    colorTheme,
    // fontTheme
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("theme");
      if (!raw) return; // nothing saved
      const saved = JSON.parse(raw); // may still throw!
      if (saved.colorTheme && AVAILABLE_COLOR_THEMES.includes(saved.colorTheme)) {
        _setColorTheme(saved.colorTheme);
      }
    } catch {
      return; // malformed JSON – fall back safely
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        colorTheme,
        setColorTheme,
        previewColorTheme,
        // fontTheme,
        // setFontTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
