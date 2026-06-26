import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { User, Lock, Phone, Monitor } from "lucide-react";
import logoUrl from "@assets/logo_1782493103781.png";

export function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"phone" | "pc">("phone");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      login(username, mode);
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f2236] to-[#591722] p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-[#0f2236]/90 backdrop-blur-md border border-[#ffffff10] rounded-2xl shadow-2xl p-8 text-white relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-white mb-6 flex items-center justify-center p-2 shadow-lg">
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
        </div>
        
        <h1 className="text-3xl font-light tracking-widest text-gray-200 mb-1">Welcome</h1>
        <h2 className="text-2xl font-bold tracking-wider mb-8">To MY BOOKS</h2>

        <div className="flex w-full bg-[#0a1628] rounded-full p-1 mb-8">
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              mode === "phone" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setMode("phone")}
          >
            <Phone size={16} /> PHONE
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              mode === "pc" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setMode("pc")}
          >
            <Monitor size={16} /> PC
          </button>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="USERNAME"
              className="w-full bg-[#0a1628] border border-[#ffffff10] rounded-lg py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="PASSWORD"
              className="w-full bg-[#0a1628] border border-[#ffffff10] rounded-lg py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg mt-4 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            Login
          </button>
        </form>

        <div className="flex justify-between w-full mt-6 text-sm">
          <button type="button" className="text-gray-400 hover:text-white transition-colors">
            Forgot password?
          </button>
          <button type="button" className="text-primary hover:text-primary/80 font-semibold transition-colors">
            Sign UP
          </button>
        </div>
      </div>
    </div>
  );
}
