import React from "react";
import { StatsCards } from "@/components/stats-cards";
import { Search } from "lucide-react";

export function Home() {
  return (
    <div className="flex-1 flex flex-col h-full items-center justify-between max-w-5xl mx-auto w-full pt-20 pb-8">
      
      <div className="flex flex-col items-center text-center mt-12 mb-16 w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Hello HR</h1>
        <p className="text-lg text-muted-foreground mb-12">Tell me what you're looking for</p>
        
        <div className="relative w-full shadow-lg">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={20} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-card border border-card-border rounded-full py-4 pl-14 pr-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg"
          />
        </div>
      </div>

      <div className="mt-auto w-full">
        <StatsCards />
      </div>
      
    </div>
  );
}
