import * as React from "react";
import { useTheme } from "@/providers";
import { AVAILABLE_COLOR_THEMES } from "@/app";

const ThemePreviewMiniApp: React.FC<{
  theme: string;
  selected: boolean;
}> = ({ theme, selected }) => {
  return (
    <div
      style={{
        width: 80,
        height: 54,
        borderRadius: "var(--fn-border-radius-s, 8px)",
        border: selected ? "2.5px solid #1976d2" : "1.5px solid #bbb",
        boxShadow: selected ? "0 0 0 2px #1976d2" : "0 1px 4px #0002",
        background: "var(--fn-app-background)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        position: "relative",
        overflow: "hidden",
        transition: "border 0.2s, box-shadow 0.2s",
      }}
      fn-data-color-theme={theme}
    >
      {/* Header */}
      <div
        style={{
          height: 10,
          background: "var(--fn-primary-color)",
          borderBottom: "1px solid var(--fn-neutral-element-border)",
        }}
      />
      {/* Body: sidebar + main */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div
          style={{
            width: 12,
            background:
              "var(--fn-surface-elevation-low, var(--fn-container-background))",
            borderRight: "1px solid var(--fn-neutral-element-border)",
          }}
        />
        {/* Main area with a node */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--fn-container-background)",
          }}
        >
          {/* Node */}
          <div
            style={{
              width: 22,
              height: 14,
              borderRadius: "var(--fn-border-radius-xs, 4px)",
              background: "var(--fn-node-background)",
              border: "1px solid var(--fn-node-header-color)",
              boxShadow: "0 1px 2px #0002",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                height: 5,
                background: "var(--fn-node-header-color)",
                borderTopLeftRadius: "var(--fn-border-radius-xs, 4px)",
                borderTopRightRadius: "var(--fn-border-radius-xs, 4px)",
              }}
            />
            <div
              style={{
                flex: 1,
                background: "transparent",
              }}
            />
          </div>
        </div>
      </div>
      {/* Theme name overlay */}
      <span
        style={{
          position: "absolute",
          bottom: 2,
          right: 4,
          fontSize: 9,
          color: "var(--fn-text-color-neutral)",
          opacity: 0.7,
          textTransform: "capitalize",
          fontWeight: 600,
          pointerEvents: "none",
        }}
      >
        {theme}
      </span>
      {/* Checkmark if selected */}
      {selected && (
        <span
          style={{
            position: "absolute",
            top: 2,
            left: 6,
            fontSize: 14,
            color: "#1976d2",
            fontWeight: 900,
            pointerEvents: "none",
          }}
          aria-label="Selected"
        >
          ✓
        </span>
      )}
    </div>
  );
};

export const AppearanceDialogContent: React.FC = () => {
  const { colorTheme, setColorTheme } = useTheme();
  const [hoveredTheme, setHoveredTheme] = React.useState<string | null>(null);
  const [prevTheme, setPrevTheme] = React.useState<string | null>(null);

  // On hover, temporarily set the theme
  const handleMouseEnter = (theme: string) => {
    if (theme !== colorTheme) {
      setPrevTheme(colorTheme as string);
      setColorTheme(theme);
      setHoveredTheme(theme);
    }
  };

  // On mouse leave, revert to previous theme if not selected
  const handleMouseLeave = (theme: string) => {
    if (hoveredTheme === theme && prevTheme && prevTheme !== theme) {
      setColorTheme(prevTheme);
    }
    setHoveredTheme(null);
    setPrevTheme(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
      <div style={{ marginBottom: 8, fontWeight: 500 }}>Theme:</div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
        gap: 16,
        justifyItems: "center"
      }}>
        {AVAILABLE_COLOR_THEMES.map((theme) => (
          <button
            key={theme}
            onClick={() => {
              setColorTheme(theme);
              setHoveredTheme(null);
              setPrevTheme(null);
            }}
            onMouseEnter={() => handleMouseEnter(theme)}
            onMouseLeave={() => handleMouseLeave(theme)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              outline: "none",
              borderRadius: 8,
            }}
            aria-label={`Select ${theme} theme`}
          >
            <ThemePreviewMiniApp
              theme={theme}
              selected={colorTheme === theme}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
