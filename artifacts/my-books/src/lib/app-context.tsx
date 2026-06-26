import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";
type Lang = "en" | "ar";

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  switchLang: (l: Lang) => void;
}

const AppContext = createContext<AppContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  lang: "en",
  switchLang: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "dark"
  );
  const [lang, setLang] = useState<Lang>(
    () => (localStorage.getItem("lang") as Lang) || "en"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const switchLang = (l: Lang) => {
    localStorage.setItem("lang", l);
    setLang(l);
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, switchLang }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
