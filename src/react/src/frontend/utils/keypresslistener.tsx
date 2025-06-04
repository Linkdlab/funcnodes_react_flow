import * as React from "react";

export const KeyContext = React.createContext<Set<string>>(new Set());
export const useKeysDown = () => React.useContext(KeyContext);
export const KeyContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [keysDown, setKeysDown] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    /* ---------- helpers ---------- */
    const add = (key: string) =>
      setKeysDown((prev) => {
        if (prev.has(key)) return prev; // no re-render spam
        const next = new Set(prev);
        next.add(key);
        return next;
      });

    const remove = (key: string) =>
      setKeysDown((prev) => {
        if (!prev.has(key)) return prev;
        const next = new Set(prev);
        next.delete(key);
        return next;
      });

    /* ---------- listeners ---------- */
    const down = (e: KeyboardEvent) => add(e.key);
    const up = (e: KeyboardEvent) => remove(e.key);
    const blur = () => setKeysDown(new Set());

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  return <KeyContext.Provider value={keysDown}>{children}</KeyContext.Provider>;
};
