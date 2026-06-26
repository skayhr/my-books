import React from "react";
import { Link } from "wouter";
import { useGetLetterTypes } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Plus } from "lucide-react";

const badgeColors = [
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-indigo-600",
  "bg-teal-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-amber-500",
];

export function Bookcase() {
  const { data: types, isLoading } = useGetLetterTypes();

  return (
    <div className="w-full max-w-6xl mx-auto py-8 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Bookcase</h1>
        <div className="flex gap-4">
          <Link href="/bookcase/manage" className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
            Manage Types
          </Link>
          <Link href="/new-book" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus size={16} /> Add Letter
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl bg-card border-card-border" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {types?.map((type, i) => {
            const badgeColor = badgeColors[i % badgeColors.length];
            return (
              <Link key={type.id} href={`/bookcase/${type.code}`} className="group block h-full">
                <div className="bg-card border border-card-border hover:border-primary/30 rounded-2xl p-6 h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold ${badgeColor} shadow-md`}>
                      {type.code}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4 line-clamp-2">{type.nameEn}</h3>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                      {type.letterCount ?? 0} Letter
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full opacity-20 pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
