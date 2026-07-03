import React, { createContext, useContext, useState, useEffect } from "react";
import { useLogout, useUpdateUser, setAuthTokenGetter, customFetch } from "@workspace/api-client-react";

// 1. تعريف واجهة المستخدم لتشمل جميع الحقول المطلوبة
export interface AuthUser {
  username: string;
  email: string;
  fullName?: string;
  jobTitle?: string;
  department?: string;
  employeeId?: string;
  phone?: string;
  avatarUrl?: string;
  mode: "phone" | "pc";
}

// 2. تعريف واجهة السياق (Context)
interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, pass: string, mode: "phone" | "pc") => Promise<{ ok: boolean; error?: string }>;
  signup: (username: string, email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<AuthUser>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("authUser");
    return stored ? JSON.parse(stored) : null;
  });

  const updateUserMutation = useUpdateUser();
  const logoutMutation = useLogout();

  const loadCurrentUser = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const data = await customFetch<AuthUser>("/api/users/me", {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
      });

      setUser({ ...data, mode: user?.mode ?? "pc" });
    } catch {
      localStorage.removeItem("authToken");
      setUser(null);
    }
  };

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("authToken"));
    loadCurrentUser();
  }, []);

  // مزامنة حالة المستخدم مع localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [user]);

  const getApiErrorMessage = (error: unknown): string | undefined => {
    if (error instanceof Error) {
      const errWithData = error as Error & { data?: unknown };
      const data = errWithData.data;
      if (data && typeof data === "object") {
        const dataRecord = data as Record<string, unknown>;
        if (typeof dataRecord.error === "string") {
          return dataRecord.error;
        }
        if (typeof dataRecord.message === "string") {
          return dataRecord.message;
        }
      }
      return error.message;
    }
    return undefined;
  };

  const login = async (username: string, pass: string, mode: "phone" | "pc") => {
    console.info("[AUTH] login request", { username, mode });
    try {
      const data = await customFetch<{ token: string } & Omit<AuthUser, "mode">>("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ username, password: pass }),
      });

      console.info("[AUTH] login response", { data });
      if (data?.token) {
        localStorage.setItem("authToken", data.token);
      }

      const u: AuthUser = { ...(data as any), mode };
      setUser(u);
      return { ok: true };
    } catch (error) {
      const message = getApiErrorMessage(error) ?? "Invalid credentials";
      console.error("Login failed:", message, error);
      return { ok: false, error: message };
    }
  };

  const signup = async (username: string, email: string, pass: string) => {
    try {
      await customFetch<void>("/api/auth/signup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ username, email, password: pass }),
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      localStorage.removeItem("authToken");
      setUser(null);
    }
  };

  const updateUser = async (updatedData: Partial<AuthUser>) => {
    if (!user) return false;
    try {
      const data = await updateUserMutation.mutateAsync({ data: updatedData as any });
      if (data) {
        const updatedUser: AuthUser = { ...user, ...(data as any) };
        setUser(updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      updateUserMutation.reset();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. هوك مخصص لاستخدام السياق
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};