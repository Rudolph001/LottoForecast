
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Calendar, 
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

export function ModelDashboard() {
  const { data: performance, isLoading: performanceLoading } = useQuery({
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

  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/predictions"],
    queryFn: async () => {
      const response = await fetch('/api/predictions');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    },
    retry: 3,
    refetchOnWindowFocus: false,
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/analysis/frequency"],
    queryFn: async () => {
      const response = await fetch('/api/analysis/frequency');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    },
    retry: 3,
    refetchOnWindowFocus: false,
  });

  if (performanceLoading || predictionsLoading || analysisLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="data-card">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="data-card">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
          <Card className="data-card">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (accuracy: number) => {
    if (accuracy >= 85) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (accuracy >= 70) return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
    if (accuracy >= 55) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-600 bg-red-50 dark:bg-red-900/20";
  };

  const getConfidenceIcon = (accuracy: number) => {
    if (accuracy >= 85) return <CheckCircle className="h-5 w-5" />;
    if (accuracy >= 70) return <Target className="h-5 w-5" />;
    if (accuracy >= 55) return <AlertCircle className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  const latestPrediction = predictions?.[predictions.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary dark:text-primary">Model Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">AI Performance & Prediction Results</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Activity className="h-4 w-4 mr-2" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Model Accuracy */}
        <Card className="data-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Model Accuracy</p>
                <p className="text-3xl font-bold text-primary dark:text-primary">
                  {performance?.accuracy?.toFixed(1)}%
                </p>
              </div>
              <div className={`p-3 rounded-full ${getConfidenceColor(performance?.accuracy || 0)}`}>
                <Brain className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getConfidenceIcon(performance?.accuracy || 0)}
              <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                {performance?.accuracy >= 85 ? 'Excellent' : 
                 performance?.accuracy >= 70 ? 'Good' : 
                 performance?.accuracy >= 55 ? 'Fair' : 'Needs Improvement'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Training Data */}
        <Card className="data-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Training Sets</p>
                <p className="text-3xl font-bold text-secondary">
                  {performance?.trainingData || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-secondary/10 text-secondary">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Historical draws analyzed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Predictions Made */}
        <Card className="data-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Predictions Made</p>
                <p className="text-3xl font-bold text-gold">
                  {performance?.predictionsMade || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gold/10 text-gold">
                <Target className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total generated
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Last Training */}
        <Card className="data-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Training</p>
                <p className="text-lg font-bold text-primary dark:text-primary">
                  {performance?.lastTrained ? 
                    new Date(performance.lastTrained).toLocaleDateString() : 
                    'Never'
                  }
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Model version {performance?.version || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis & Latest Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Breakdown */}
        <Card className="data-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
              Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-sm font-medium">Overall Accuracy</span>
                <Badge variant="secondary">{performance?.accuracy?.toFixed(1)}%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-sm font-medium">7-Day Average</span>
                <Badge variant="outline">{performance?.weeklyAccuracy?.toFixed(1)}%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-sm font-medium">30-Day Average</span>
                <Badge variant="outline">{performance?.monthlyAccuracy?.toFixed(1)}%</Badge>
              </div>
            </div>

            {analysis && (
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Pattern Analysis</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Odd/Even Ratio:</span>
                    <span className="ml-2 font-mono">{analysis.patterns.oddEvenRatio}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">High/Low Split:</span>
                    <span className="ml-2 font-mono">{analysis.patterns.highLowSplit}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Sum Range:</span>
                    <span className="ml-2 font-mono">{analysis.patterns.sumRange}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Trending Number:</span>
                    <span className="ml-2 font-mono">{analysis.trending}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Prediction Results */}
        <Card className="data-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
              Latest Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestPrediction ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Generated</span>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(latestPrediction.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Main Numbers</div>
                    <div className="flex justify-center space-x-2 mb-4">
                      {latestPrediction.mainNumbers.map((num: number, index: number) => (
                        <div key={index} className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                          {num}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Lucky Stars</div>
                    <div className="flex justify-center space-x-2">
                      {latestPrediction.luckyStars.map((star: number, index: number) => (
                        <div key={index} className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {star}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-lg font-bold text-primary dark:text-primary">
                      {latestPrediction.confidenceScore?.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Confidence</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-lg font-bold text-secondary">
                      {latestPrediction.patternMatch}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Pattern Match</div>
                  </div>
                </div>

                <div className="text-center">
                  <Badge variant="outline" className="px-3 py-1">
                    Model {latestPrediction.modelVersion}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No predictions generated yet</p>
                <p className="text-sm">Generate your first prediction to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Predictions History */}
      {predictions && predictions.length > 0 && (
        <Card className="data-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
              Prediction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictions.slice(-5).reverse().map((prediction: any, index: number) => (
                <div key={prediction.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(prediction.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-1">
                      {prediction.mainNumbers.map((num: number, i: number) => (
                        <div key={i} className="w-6 h-6 bg-primary/20 text-primary rounded text-xs flex items-center justify-center font-mono">
                          {num}
                        </div>
                      ))}
                      <span className="mx-1 text-slate-400">+</span>
                      {prediction.luckyStars.map((star: number, i: number) => (
                        <div key={i} className="w-6 h-6 bg-gold/20 text-gold rounded text-xs flex items-center justify-center font-mono">
                          {star}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {prediction.confidenceScore?.toFixed(0)}%
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {prediction.patternMatch}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
