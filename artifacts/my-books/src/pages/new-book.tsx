import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { useGetLetterTypes, useLookupEmployee, useCreateLetter } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function NewBook() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: letterTypes, isLoading: loadingTypes } = useGetLetterTypes();
  
  const [employeeId, setEmployeeId] = useState("");
  const [debouncedEmpId, setDebouncedEmpId] = useState("");
  
  const [formData, setFormData] = useState({
    letterTypeId: "",
    employeeFullName: "",
    jobTitle: "",
    department: "",
    bookDate: new Date().toISOString().split("T")[0],
    pdfUrl: ""
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmpId(employeeId);
    }, 500);
    return () => clearTimeout(timer);
  }, [employeeId]);

  const { data: employeeData, isLoading: lookingUp } = useLookupEmployee(debouncedEmpId, {
    query: {
      enabled: debouncedEmpId.length > 0,
      retry: false
    }
  });

  useEffect(() => {
    if (employeeData) {
      setFormData(prev => ({
        ...prev,
        employeeFullName: employeeData.fullName,
        jobTitle: employeeData.jobTitle,
        department: employeeData.department
      }));
    }
  }, [employeeData]);

  const createLetter = useCreateLetter({
    mutation: {
      onSuccess: () => {
        toast({ title: "Letter Created successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/letters"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        setLocation("/bookcase");
      },
      onError: (err) => {
        toast({ title: "Error creating letter", variant: "destructive" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.letterTypeId || !employeeId || !formData.employeeFullName) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    createLetter.mutate({
      data: {
        letterTypeId: parseInt(formData.letterTypeId),
        employeeId: employeeId,
        employeeFullName: formData.employeeFullName,
        jobTitle: formData.jobTitle,
        department: formData.department,
        bookDate: formData.bookDate,
        pdfUrl: formData.pdfUrl || null
      }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Add new book</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card border border-card-border p-8 rounded-2xl shadow-sm">
        
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Letter Type</label>
            <select 
              className="bg-background border border-border rounded-lg py-2.5 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
              value={formData.letterTypeId}
              onChange={(e) => setFormData({...formData, letterTypeId: e.target.value})}
              required
            >
              <option value="">Select type...</option>
              {letterTypes?.map(type => (
                <option key={type.id} value={type.id}>{type.nameEn} ({type.nameAr})</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
            <div className="relative">
              <input 
                type="text"
                className="bg-background border border-border rounded-lg py-2.5 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP001"
                required
              />
              {lookingUp && <span className="absolute right-3 top-3 text-xs text-muted-foreground">Looking up...</span>}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Employee Full Name</label>
            <input 
              type="text"
              className="bg-background border border-border rounded-lg py-2.5 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
              value={formData.employeeFullName}
              onChange={(e) => setFormData({...formData, employeeFullName: e.target.value})}
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Job Title</label>
            <input 
              type="text"
              className="bg-background border border-border rounded-lg py-2.5 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
              value={formData.jobTitle}
              onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <input 
                type="text"
                className="bg-background border border-border rounded-lg py-2.5 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Book Date</label>
              <input 
                type="date"
                className="bg-background border border-border rounded-lg py-2.5 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                value={formData.bookDate}
                onChange={(e) => setFormData({...formData, bookDate: e.target.value})}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col h-full">
          <label className="text-sm font-medium text-muted-foreground mb-2">Upload PDF File</label>
          <div className="flex-1 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-8 bg-background/50 hover:bg-background transition-colors cursor-pointer relative overflow-hidden group">
            <input 
              type="file" 
              accept=".pdf" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                if(e.target.files?.length) {
                  // Fake upload
                  setFormData({...formData, pdfUrl: URL.createObjectURL(e.target.files[0])});
                  toast({ title: "File attached temporarily" });
                }
              }}
            />
            {formData.pdfUrl ? (
               <div className="flex flex-col items-center text-primary">
                 <CheckCircle2 size={48} className="mb-4" />
                 <span className="font-semibold">PDF Attached</span>
                 <span className="text-xs text-muted-foreground mt-2">Click to replace</span>
               </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <UploadCloud size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Click to upload PDF</h3>
                <p className="text-sm text-muted-foreground mt-1">PDF files only</p>
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-4 mt-8">
            <button 
              type="button" 
              onClick={() => setLocation("/")}
              className="px-6 py-2.5 rounded-lg font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={createLetter.isPending}
              className="px-8 py-2.5 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-red-600 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createLetter.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
