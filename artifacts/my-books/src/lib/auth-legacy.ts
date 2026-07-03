import { useState, useEffect } from "react";

type AuthUser = {
  username: string;
  mode: "phone" | "pc";
};

type Account = {
  username: string;
  password: string;
  email: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (username: string, password: string, mode: "phone" | "pc"): boolean => {
    const accounts: Account[] = JSON.parse(localStorage.getItem("accounts") || "[]");
    const found = accounts.find((a) => a.username === username && a.password === password);
    if (!found && accounts.length > 0) return false;
    const u = { username, mode };
    localStorage.setItem("auth_user", JSON.stringify(u));
    setUser(u);
    return true;
  };

  const signup = (username: string, email: string, password: string): boolean => {
    const accounts: Account[] = JSON.parse(localStorage.getItem("accounts") || "[]");
    if (accounts.find((a) => a.username === username)) return false;
    accounts.push({ username, email, password });
    localStorage.setItem("accounts", JSON.stringify(accounts));
    return true;
  };

  const logout = () => {
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  return { user, login, logout, signup };
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
}

export function useLanguage() {
  const [lang, setLang] = useState<"en" | "ar">(() => {
    return (localStorage.getItem("lang") as "en" | "ar") || "en";
  });

  const switchLang = (l: "en" | "ar") => {
    localStorage.setItem("lang", l);
    setLang(l);
  };

  return { lang, switchLang };
}
