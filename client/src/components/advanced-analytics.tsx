import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip,
  Area,
  AreaChart
} from "recharts";

export function AdvancedAnalytics() {
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/analysis/frequency"],
  });

  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/model/performance"],
  });

  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/predictions"],
  });

  // Mock performance data for chart
  const performanceData = [
    { week: 'Week 1', accuracy: 87 },
    { week: 'Week 2', accuracy: 91 },
    { week: 'Week 3', accuracy: 89 },
    { week: 'Week 4', accuracy: 94 },
  ];

  const recentPredictions = [
    { date: 'July 4, 2025', drawNumber: '1851', matches: '3/5', accuracy: 'high' },
    { date: 'June 29, 2025', drawNumber: '1850', matches: '4/5', accuracy: 'very-high' },
    { date: 'June 25, 2025', drawNumber: '1849', matches: '2/5', accuracy: 'medium' },
  ];

  const getMatchBadgeVariant = (matches: string) => {
    const matchCount = parseInt(matches.split('/')[0]);
    if (matchCount >= 4) return 'default'; // Gold-like for very high
    if (matchCount >= 3) return 'secondary'; // Green for high
    return 'outline'; // Red for medium/low
  };

  if (analysisLoading || performanceLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="data-card">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Pattern Recognition */}
      <Card className="data-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
            Pattern Recognition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
            <h4 className="font-medium text-primary dark:text-primary mb-2">Sequential Patterns</h4>
            <div className="text-2xl font-bold text-primary dark:text-primary">
              {analysis?.patterns?.sequentialAccuracy || 'N/A'}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Consecutive number accuracy
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Odd/Even Balance</span>
              <span className="font-mono text-primary dark:text-primary">
                {analysis?.patterns?.oddEvenRatio || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">High/Low Split</span>
              <span className="font-mono text-primary dark:text-primary">
                {analysis?.patterns?.highLowSplit || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Sum Range</span>
              <span className="font-mono text-primary dark:text-primary">
                {analysis?.patterns?.sumRange || 'N/A'}
              </span>
            </div>
              <span className="font-mono text-primary dark:text-primary">
                {analysis?.patterns?.highLowSplit || '2:3'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Sum Range</span>
              <span className="font-mono text-primary dark:text-primary">
                {analysis?.patterns?.sumRange || '110-140'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card className="data-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
            Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(159, 85%, 40%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(159, 85%, 40%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" className="text-xs" />
                <YAxis domain={[80, 100]} className="text-xs" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value}%`, 'Accuracy']}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="hsl(159, 85%, 40%)"
                  fillOpacity={1}
                  fill="url(#accuracyGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-secondary/10 dark:bg-secondary/20 rounded-lg p-3">
              <div className="text-lg font-bold text-secondary">
                {performance?.weeklyAccuracy?.toFixed(1) || '92.1'}%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">7-Day Avg</div>
            </div>
            <div className="bg-gold/10 dark:bg-gold/20 rounded-lg p-3">
              <div className="text-lg font-bold text-gold">
                {performance?.monthlyAccuracy?.toFixed(1) || '89.7'}%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">30-Day Avg</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Predictions */}
      <Card className="data-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
            Recent Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPredictions.map((prediction, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {prediction.date}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Draw #{prediction.drawNumber}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getMatchBadgeVariant(prediction.matches)}>
                    {prediction.matches}
                  </Badge>
                  <span className="text-xs text-slate-600 dark:text-slate-400">matches</span>
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            size="sm"
          >
            View All Predictions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
