import React, { useState } from "react";
import { useGetLetterTypes, useCreateLetterType, useDeleteLetterType } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ManageTypes() {
  const { data: types, isLoading } = useGetLetterTypes();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: ""
  });

  const createType = useCreateLetterType({
    mutation: {
      onSuccess: () => {
        toast({ title: "Letter type created" });
        setFormData({ code: "", nameAr: "", nameEn: "" });
        queryClient.invalidateQueries({ queryKey: ["/api/letter-types"] });
      }
    }
  });

  const deleteType = useDeleteLetterType({
    mutation: {
      onSuccess: () => {
        toast({ title: "Letter type deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/letter-types"] });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.code && formData.nameAr && formData.nameEn) {
      createType.mutate({ data: formData });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 flex flex-col h-full">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/bookcase" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Manage Letter Types</h1>
          <p className="text-sm text-muted-foreground mt-1">Add or remove letter types from the bookcase</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="bg-card border border-card-border p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <h2 className="font-semibold text-lg mb-2">Add New Type</h2>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Code (e.g. A, B)</label>
              <input 
                type="text"
                maxLength={2}
                className="bg-background border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary uppercase w-full"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Name (English)</label>
              <input 
                type="text"
                className="bg-background border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                value={formData.nameEn}
                onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Name (Arabic)</label>
              <input 
                type="text"
                className="bg-background border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                value={formData.nameAr}
                onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={createType.isPending}
              className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Plus size={18} /> Add Type
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium border-b border-border w-16">CODE</th>
                  <th className="px-6 py-4 font-medium border-b border-border">NAME (EN)</th>
                  <th className="px-6 py-4 font-medium border-b border-border">NAME (AR)</th>
                  <th className="px-6 py-4 font-medium border-b border-border w-24">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-8" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-10" /></td>
                    </tr>
                  ))
                ) : types && types.length > 0 ? (
                  types.map((type) => (
                    <tr key={type.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary">{type.code}</td>
                      <td className="px-6 py-4 font-medium">{type.nameEn}</td>
                      <td className="px-6 py-4 text-right" dir="rtl">{type.nameAr}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {
                            if(confirm("Are you sure?")) deleteType.mutate({ id: type.id });
                          }}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground">
                      No letter types defined.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
