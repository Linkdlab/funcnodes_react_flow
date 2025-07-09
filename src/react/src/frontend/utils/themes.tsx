import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type ColorTheme = "classic" | "metal";
// type FontTheme = "sans" | "serif";
const AVAILABLE_COLOR_THEMES: ColorTheme[] = ["classic", "metal"];
// const AVAILABLE_FONT_THEMES: FontTheme[] = ["sans", "serif"];
type Theme = {
  colorTheme: ColorTheme;
  // fontTheme: FontTheme;
};
const ThemeContext = createContext<{
  colorTheme: ColorTheme;
  setColorTheme: (t: ColorTheme) => void;
  //   fontTheme: FontTheme;
  //   setFontTheme: (t: FontTheme) => void;
}>({
  colorTheme: "classic",
  setColorTheme: () => {},
  //   fontTheme: "sans",
  //   setFontTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [colorTheme, setColorTheme] = useState<ColorTheme>("classic");
  //   const [fontTheme, setFontTheme] = useState<FontTheme>("sans");

  const setTheme = (theme: unknown) => {
    if (typeof theme !== "object" || theme === null) return;

    if (theme.hasOwnProperty("colorTheme")) {
      const newColorTheme = (theme as { colorTheme?: ColorTheme }).colorTheme;
      if (newColorTheme && AVAILABLE_COLOR_THEMES.includes(newColorTheme)) {
        setColorTheme(newColorTheme);
      }
    }
    // if (theme.hasOwnProperty("fontTheme")) {
    //   const newFontTheme = (theme as { fontTheme?: FontTheme }).fontTheme;
    //   if (newFontTheme && AVAILABLE_FONT_THEMES.includes(newFontTheme)) {
    //     setFontTheme(newFontTheme);
    //   }
    // }
  };
  useEffect(() => {
    document.documentElement.setAttribute("data-color-theme", colorTheme);
    // document.documentElement.setAttribute("data-font-theme", fontTheme);
    const savetheme: Theme = {
      colorTheme,
      // fontTheme,
    };
    localStorage.setItem("theme", JSON.stringify(savetheme));
  }, [
    colorTheme,
    // fontTheme
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("theme");
      if (!raw) return; // nothing saved
      const saved = JSON.parse(raw); // may still throw!
      setTheme(saved);
    } catch {
      return; // malformed JSON – fall back safely
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        colorTheme,
        setColorTheme,
        // fontTheme,
        // setFontTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
