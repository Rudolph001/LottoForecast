import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from "recharts";

// Function to calculate next EuroMillions draw date (Tuesday or Friday)
function getNextDrawDate(): string {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  let nextDraw = new Date(now);
  
  if (currentDay === 0) { // Sunday
    nextDraw.setDate(now.getDate() + 2); // Tuesday
  } else if (currentDay === 1) { // Monday
    nextDraw.setDate(now.getDate() + 1); // Tuesday
  } else if (currentDay === 2) { // Tuesday
    // If it's Tuesday and before 21:05, next draw is today, otherwise Friday
    if (now.getHours() < 21 || (now.getHours() === 21 && now.getMinutes() < 5)) {
      // Next draw is today (Tuesday)
      return "Tuesday, " + nextDraw.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }) + " at 21:05 CET";
    } else {
      nextDraw.setDate(now.getDate() + 3); // Friday
    }
  } else if (currentDay === 3) { // Wednesday
    nextDraw.setDate(now.getDate() + 2); // Friday
  } else if (currentDay === 4) { // Thursday
    nextDraw.setDate(now.getDate() + 1); // Friday
  } else if (currentDay === 5) { // Friday
    // If it's Friday and before 21:05, next draw is today, otherwise Tuesday
    if (now.getHours() < 21 || (now.getHours() === 21 && now.getMinutes() < 5)) {
      // Next draw is today (Friday)
      return "Friday, " + nextDraw.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }) + " at 21:05 CET";
    } else {
      nextDraw.setDate(now.getDate() + 4); // Tuesday
    }
  } else if (currentDay === 6) { // Saturday
    nextDraw.setDate(now.getDate() + 3); // Tuesday
  }
  
  const dayName = nextDraw.getDay() === 2 ? "Tuesday" : "Friday";
  
  return dayName + ", " + nextDraw.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }) + " at 21:05 CET";
}

export function PredictionsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: prediction, isLoading: predictionLoading } = useQuery({
    queryKey: ["/api/predictions/latest"],
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/analysis/frequency"],
  });

  const generateMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/predictions/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/predictions/latest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/predictions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/model/performance"] });
      toast({
        title: "New Prediction Generated",
        description: "Fresh AI predictions are now available",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const frequencyData = analysis?.frequencyData ? [
    { range: '1-10', frequency: analysis.frequencyData[0] },
    { range: '11-20', frequency: analysis.frequencyData[1] },
    { range: '21-30', frequency: analysis.frequencyData[2] },
    { range: '31-40', frequency: analysis.frequencyData[3] },
    { range: '41-50', frequency: analysis.frequencyData[4] },
  ] : [];

  const getBarColor = (index: number) => {
    const colors = ['hsl(217, 78%, 33%)', 'hsl(217, 78%, 40%)', 'hsl(217, 78%, 47%)', 'hsl(217, 78%, 54%)', 'hsl(217, 78%, 61%)'];
    return colors[index] || 'hsl(217, 78%, 33%)';
  };

  if (predictionLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="data-card">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card className="data-card">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Predictions */}
      <Card className="data-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
              Next Draw Predictions
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {getNextDrawDate()}
            </p>
          </div>
          <Button 
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="bg-secondary hover:bg-secondary/90 text-white"
            size="sm"
          >
            {generateMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Generate New
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Numbers */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Main Numbers (5 of 50)
            </h4>
            <div className="flex space-x-3 justify-center">
              {prediction?.mainNumbers ? prediction.mainNumbers.map((number: number, index: number) => (
                <div key={index} className="number-ball bg-primary text-white dark:bg-primary dark:text-white">
                  {number}
                </div>
              )) : (
                <div className="text-center text-slate-500">
                  No predictions available. Generate predictions after uploading data.
                </div>
              )}
            </div>
          </div>

          {/* Lucky Stars */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Lucky Stars (2 of 12)
            </h4>
            <div className="flex space-x-3 justify-center">
              {prediction?.luckyStars ? prediction.luckyStars.map((star: number, index: number) => (
                <div 
                  key={index}
                  className="number-ball bg-yellow-200 text-black border-2 border-yellow-400"
                >
                  {star}
                </div>
              )) : (
                <div className="text-center text-slate-500">
                  No lucky stars generated yet. Click "Generate New" to create predictions.
                </div>
              )}
            </div>
          </div>

          {prediction ? (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Confidence Score:</span>
                  <span className="font-semibold text-secondary">
                    {prediction.confidenceScore.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Model Used:</span>
                  <span className="font-mono text-primary dark:text-primary">
                    {prediction.modelVersion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Pattern Match:</span>
                  <span className="font-semibold text-gold">
                    {prediction.patternMatch}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Generated:</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {new Date(prediction.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center text-slate-500 dark:text-slate-400">
              <p>No predictions generated yet</p>
              <p className="text-sm">Upload historical data and generate predictions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historical Analysis Chart */}
      <Card className="data-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
            Number Frequency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysisLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : analysis ? (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequencyData}>
                    <XAxis dataKey="range" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="frequency" radius={[4, 4, 0, 0]}>
                      {frequencyData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-bold text-primary dark:text-primary">
                    {analysis.mostFrequent}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">Most Frequent</div>
                </div>
                <div>
                  <div className="font-bold text-accent">
                    {analysis.leastFrequent}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">Least Frequent</div>
                </div>
                <div>
                  <div className="font-bold text-secondary">
                    {analysis.trending}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">Trending Up</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 py-8">
              No frequency analysis available. Please upload historical CSV data first.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}