import React, { useState } from "react";
import { StatsCards } from "@/components/stats-cards";
import { Search } from "lucide-react";
import { useLanguage } from "@/lib/auth";

export function Home() {
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");

  return (
    <div
      className="flex-1 flex flex-col min-h-full"
      style={{ background: "#0d1b2e" }}
    >
      {/* Center section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-8 pb-4">
        <h1 className="text-4xl md:text-5xl font-light text-white mb-3 tracking-wide">
          {lang === "ar" ? "مرحباً HR..." : "Hello HR..."}
        </h1>
        <p className="text-base text-gray-400 mb-10">
          {lang === "ar" ? "أخبرني ما الذي تبحث عنه." : "Tell me what you're looking for."}
        </p>

        <div
          className="relative w-full max-w-xl shadow-xl"
        >
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder={lang === "ar" ? "ابحث هنا..." : "Search..."}
            className="w-full rounded-full py-4 pl-14 pr-6 text-white placeholder:text-gray-500 focus:outline-none transition-all text-base"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            dir={lang === "ar" ? "rtl" : "ltr"}
          />
        </div>
      </div>

      {/* Stats cards at bottom */}
      <div className="px-8 pb-10">
        <StatsCards lang={lang} />
      </div>
    </div>
  );
}
