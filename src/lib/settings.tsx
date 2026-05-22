import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type ThemeMode = "light" | "dark";
export type AccentKey = "indigo" | "ocean" | "emerald" | "amber" | "coral" | "rose" | "custom";

interface SettingsState {
  theme: ThemeMode;
  accent: AccentKey;
  customHue: number;
  vendedores: string[];
  hydrated: boolean;
  setTheme: (t: ThemeMode) => void;
  setAccent: (a: AccentKey) => void;
  setCustomHue: (h: number) => void;
  addVendedor: (n: string) => void;
  removeVendedor: (n: string) => void;
  renameVendedor: (oldName: string, newName: string) => void;
}

const Ctx = createContext<SettingsState | null>(null);
const KEY = "vertbien-settings-v1";

const ACCENT_HUE: Record<Exclude<AccentKey, "custom">, number> = {
  indigo: 270,
  ocean: 220,
  emerald: 160,
  amber: 70,
  coral: 25,
  rose: 350,
};

const DEFAULT: Omit<SettingsState, "hydrated" | "setTheme" | "setAccent" | "setCustomHue" | "addVendedor" | "removeVendedor" | "renameVendedor"> = {
  theme: "light",
  accent: "emerald",
  customHue: 175,
  vendedores: ["Ana", "Lucía", "Sofía", "Martina", "Valentina"],
};

function applyTheme(theme: ThemeMode, accent: AccentKey, customHue: number) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");

  const hue = accent === "custom" ? customHue : ACCENT_HUE[accent];
  root.style.setProperty("--primary", `oklch(0.62 0.15 ${hue})`);
  root.style.setProperty("--primary-glow", `oklch(0.75 0.16 ${hue - 10})`);
  root.style.setProperty("--ring", `oklch(0.62 0.15 ${hue})`);
  root.style.setProperty("--sidebar-primary", `oklch(0.62 0.15 ${hue})`);
  root.style.setProperty("--sidebar-ring", `oklch(0.62 0.15 ${hue})`);
  root.style.setProperty(
    "--gradient-primary",
    `linear-gradient(135deg, oklch(0.62 0.15 ${hue}), oklch(0.72 0.16 ${hue - 10}))`
  );
  root.style.setProperty("--shadow-soft", `0 4px 20px -8px oklch(0.62 0.15 ${hue} / 0.25)`);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
    applyTheme(state.theme, state.accent, state.customHue);
  }, [state, hydrated]);

  const setTheme = useCallback((t: ThemeMode) => setState((s) => ({ ...s, theme: t })), []);
  const setAccent = useCallback((a: AccentKey) => setState((s) => ({ ...s, accent: a })), []);
  const setCustomHue = useCallback((h: number) => setState((s) => ({ ...s, customHue: h, accent: "custom" })), []);
  const addVendedor = useCallback((n: string) => {
    const v = n.trim();
    if (!v) return;
    setState((s) => s.vendedores.includes(v) ? s : ({ ...s, vendedores: [...s.vendedores, v] }));
  }, []);
  const removeVendedor = useCallback((n: string) => {
    setState((s) => ({ ...s, vendedores: s.vendedores.filter((x) => x !== n) }));
  }, []);
  const renameVendedor = useCallback((oldName: string, newName: string) => {
    const v = newName.trim();
    if (!v) return;
    setState((s) => ({ ...s, vendedores: s.vendedores.map((x) => x === oldName ? v : x) }));
  }, []);

  return (
    <Ctx.Provider value={{ ...state, hydrated, setTheme, setAccent, setCustomHue, addVendedor, removeVendedor, renameVendedor }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSettings must be inside SettingsProvider");
  return c;
}

export const ACCENT_PRESETS: { key: AccentKey; label: string; hue: number }[] = [
  { key: "indigo", label: "Índigo", hue: ACCENT_HUE.indigo },
  { key: "ocean", label: "Océano", hue: ACCENT_HUE.ocean },
  { key: "emerald", label: "Esmeralda", hue: ACCENT_HUE.emerald },
  { key: "amber", label: "Ámbar", hue: ACCENT_HUE.amber },
  { key: "coral", label: "Coral", hue: ACCENT_HUE.coral },
  { key: "rose", label: "Rosa", hue: ACCENT_HUE.rose },
];