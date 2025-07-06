import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function QuickStats() {
  const { data: performance, isLoading, error } = useQuery({
    queryKey: ["/api/model/performance"],
    queryFn: async () => {
      const response = await fetch('/api/model/performance');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    },
    refetchInterval: 30000,
    retry: 3,
    refetchOnWindowFocus: false,
  });



  if (isLoading) {
    return (
      <Card className="data-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
            AI Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!performance) {
    return (
      <Card className="data-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
            AI Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-slate-500">
            Loading model performance...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (performance.trainingData === 0) {
    return (
      <Card className="data-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
            AI Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-slate-500">
            No training data available. Please upload historical CSV data to train the model.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="data-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
          AI Model Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="metric-gradient-secondary rounded-lg p-4 text-white">
          <div className="text-2xl font-bold font-mono">
            {performance.accuracy.toFixed(1)}%
          </div>
          <div className="text-sm opacity-90">Prediction Accuracy</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold font-mono text-primary dark:text-primary">
              {performance.trainingData.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Training Sets</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold font-mono text-primary dark:text-primary">
              {performance.predictionsMade}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Predictions Made</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Model Version:</span>
            <span className="font-mono text-primary dark:text-primary">
              {performance.version}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Last Training:</span>
            <span className="text-secondary">
              {new Date(performance.lastTrained).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Confidence:</span>
            <span className="text-gold font-medium">
              {performance.accuracy >= 85 ? 'High' : performance.accuracy >= 70 ? 'Medium' : 'Low'} ({performance.accuracy.toFixed(0)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
