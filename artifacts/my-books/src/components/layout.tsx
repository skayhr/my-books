import React from "react";
import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { useAuth, useTheme } from "@/lib/auth";
import logoUrl from "@assets/logo_1782493103781.png";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  if (!user && location !== "/login") {
    setLocation("/login");
    return null;
  }

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "New Book", href: "/new-book" },
    { label: "Bookcase", href: "/bookcase" },
    { label: "Report", href: "/report" },
    { label: "Emp data", href: "/emp-data" },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground transition-colors duration-200">
      {user && (
        <header className="h-16 flex items-center justify-between px-6 shrink-0 bg-gradient-to-r from-[#0f2236] to-[#591722] text-white shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-wider text-gray-300">ERBIL REFINERY / KAR-3</span>
              <span className="text-sm font-bold text-white tracking-wide">MY BOOKS</span>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-primary border-b-2 border-primary" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="text-xs font-medium text-gray-300 hover:text-white transition-colors">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button onClick={logout} className="text-xs font-medium text-gray-300 hover:text-white transition-colors">
              Logout
            </button>
            <button className="text-gray-300 hover:text-white">
              <Menu size={24} />
            </button>
          </div>
        </header>
      )}
      <main className="flex-1 w-full h-full flex flex-col p-6">
        {children}
      </main>
    </div>
  );
}
