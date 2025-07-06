import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UploadStats {
  recordsProcessed: number;
  lastUpload: string;
  status: string;
}

export function DataUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    recordsProcessed: 0,
    lastUpload: 'No uploads yet',
    status: 'Ready'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/upload-data', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setUploadStats({
        recordsProcessed: data.recordsProcessed,
        lastUpload: 'Just now',
        status: 'Active'
      });
      toast({
        title: "Upload Successful",
        description: `Processed ${data.recordsProcessed} records`,
      });
      // Invalidate all queries that depend on uploaded data
      queryClient.invalidateQueries({ queryKey: ['/api/draws'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analysis/frequency'] });
      queryClient.invalidateQueries({ queryKey: ['/api/model/performance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/predictions/latest'] });
      queryClient.invalidateQueries({ queryKey: ['/api/predictions'] });
      // Clear all cache and force refetch
      queryClient.clear();
      // Force page reload to ensure fresh data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      queryClient.invalidateQueries({ queryKey: ['/api/predictions'] });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Please try again with a valid CSV file",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);
    uploadMutation.mutate(formData);
  };

  return (
    <Card className="data-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary dark:text-primary flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Historical Data Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragActive 
              ? 'border-primary bg-primary/5 dark:bg-primary/10' 
              : 'border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-primary'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('csvFile')?.click()}
        >
          <input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
          
          {uploadMutation.isPending ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300">Processing file...</p>
            </div>
          ) : (
            <>
              <FileText className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300 mb-2">
                Drop CSV file here or click to browse
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Supports: Date, Draw Order, Numbers, Lucky Stars, Jackpot
              </p>
              <Button className="mt-3" variant="outline" size="sm">
                Select File
              </Button>
            </>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Last Upload:</span>
            <span className="text-secondary font-medium flex items-center">
              <Check className="w-3 h-3 mr-1" />
              {uploadStats.lastUpload}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Records Processed:</span>
            <span className="font-mono font-medium text-foreground">
              {uploadStats.recordsProcessed.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Training Status:</span>
            <span className="text-secondary font-medium">{uploadStats.status}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
