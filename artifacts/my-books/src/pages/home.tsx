import React, { useState } from "react";
import { StatsCards } from "@/components/stats-cards";
import { Search } from "lucide-react";
import { useAppContext } from "@/lib/app-context";

export function Home() {
  const { lang, theme } = useAppContext();
  const [query, setQuery] = useState("");
  const isDark = theme === "dark";

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] bg-background transition-colors duration-300">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-6 relative">

        {/* Radial glow — kept, no change */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "700px",
            height: "340px",
            background: isDark
              ? "radial-gradient(ellipse at center, rgba(30,90,180,0.32) 0%, rgba(20,60,140,0.14) 50%, transparent 75%)"
              : "radial-gradient(ellipse at center, rgba(80,130,220,0.22) 0%, rgba(60,110,200,0.10) 50%, transparent 75%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
          }}
        />

        <h1 className="text-4xl md:text-5xl font-light text-foreground mb-3 tracking-wide relative z-10">
          {lang === "ar" ? "مرحباً HR..." : "Hello HR..."}
        </h1>
        <p className="text-base text-muted-foreground mb-8 relative z-10">
          {lang === "ar" ? "أخبرني ما الذي تبحث عنه." : "Tell me what you're looking for."}
        </p>

        {/* Search bar — unified strip, no shadow, no border */}
        <div className="relative w-full max-w-xl z-10">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={17} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder={lang === "ar" ? "ابحث هنا..." : "Search..."}
            className="w-full rounded-full py-3.5 pl-13 pr-6 focus:outline-none transition-all text-base text-foreground placeholder:text-muted-foreground"
            style={
              isDark
                ? {
                    background: "rgba(255,255,255,0.07)",
                    border: "none",
                    boxShadow: "none",
                  }
                : {
                    background: "#ffffff",
                    border: "none",
                    boxShadow: "none",
                  }
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            dir={lang === "ar" ? "rtl" : "ltr"}
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="flex justify-center px-6 pb-12">
        <div className="w-full max-w-2xl">
          <StatsCards />
        </div>
      </div>
    </div>
  );
}
