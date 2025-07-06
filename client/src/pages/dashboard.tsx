import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JackpotBanner } from "@/components/jackpot-banner";
import { QuickStats } from "@/components/quick-stats";
import { PredictionsPanel } from "@/components/predictions-panel";
import { AdvancedAnalytics } from "@/components/advanced-analytics";
import { DataUpload } from "@/components/data-upload";
import { CurrencyConverter } from "@/components/currency-converter";
import { ModelDashboard } from "@/components/model-dashboard";
import { BudgetDashboard } from "@/components/budget-dashboard";
import { Sparkles, TrendingUp, Calculator, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Menu } from "lucide-react";

export function Dashboard() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { theme, setTheme } = useTheme();

  // Update activeTab based on current route
  useEffect(() => {
    if (location === "/" || location === "/dashboard") {
      setActiveTab("dashboard");
    } else if (location === "/model") {
      setActiveTab("model");
    } else if (location === "/predictions") {
      setActiveTab("predictions");
    } else if (location === "/analysis") {
      setActiveTab("analysis");
    } else if (location === "/converter") {
      setActiveTab("converter");
    } else if (location === "/budget") {
      setActiveTab("budget");
    }
  }, [location]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "dashboard") {
      setLocation("/");
    } else {
      setLocation(`/${tab}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card dark:bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EM</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary dark:text-primary">EuroMillions AI</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Professional Prediction Platform</p>
                </div>
              </div>
            </div>
             <nav className="hidden md:flex items-center space-x-6">
                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  onClick={() => handleTabChange("dashboard")}
                  className="flex items-center space-x-2 px-6 py-2"
                >
                  <span>Overview</span>
                </Button>
                <Button
                  variant={activeTab === "model" ? "default" : "ghost"}
                  onClick={() => handleTabChange("model")}
                  className="flex items-center space-x-2 px-6 py-2"
                >
                  <span>Model Dashboard</span>
                </Button>
                <Button
                  variant={activeTab === "predictions" ? "default" : "ghost"}
                  onClick={() => handleTabChange("predictions")}
                  className="flex items-center space-x-2 px-6 py-2"
                >
                  <span>Predictions</span>
                </Button>
                <Button
                  variant={activeTab === "analysis" ? "default" : "ghost"}
                  onClick={() => handleTabChange("analysis")}
                  className="flex items-center space-x-2 px-6 py-2"
                >
                  <span>Analysis</span>
                </Button>
                <Button
                  variant={activeTab === "converter" ? "default" : "ghost"}
                  onClick={() => handleTabChange("converter")}
                  className="flex items-center space-x-2 px-6 py-2"
                >
                  <span>Converter</span>
                </Button>
                <Button
                  variant={activeTab === "budget" ? "default" : "ghost"}
                  onClick={() => handleTabChange("budget")}
                  className="flex items-center space-x-2 px-6 py-2"
                >
                  <span>Budget</span>
                </Button>
              </nav>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {activeTab === "dashboard" && (
          <>
            {/* Current Jackpot Banner */}
            <JackpotBanner />

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <DataUpload />
              <CurrencyConverter />
              <QuickStats />
            </div>

            {/* Predictions Section */}
            <PredictionsPanel />

            {/* Advanced Analytics */}
            <AdvancedAnalytics />
          </>
        )}

        {activeTab === "model" && <ModelDashboard />}
        {activeTab === "predictions" && <PredictionsPanel />}
        {activeTab === "analysis" && <AdvancedAnalytics />}
        {activeTab === "converter" && <CurrencyConverter />}
        {activeTab === "budget" && <BudgetDashboard />}

      </main>

      {/* Footer */}
      <footer className="bg-card dark:bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EM</span>
                </div>
                <div>
                  <h3 className="font-bold text-primary dark:text-primary">EuroMillions AI Predictor</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Professional Lottery Analysis Platform</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Advanced machine learning algorithms for EuroMillions number prediction. 
                This platform uses historical data analysis and pattern recognition to provide 
                intelligent lottery predictions.
              </p>
              <div className="flex space-x-4">
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  <div>Exchange rates powered by live APIs</div>
                  <div>ML models updated daily</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>AI Predictions</li>
                <li>Currency Converter</li>
                <li>Pattern Analysis</li>
                <li>Historical Data</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Contact Support</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-slate-500 dark:text-slate-500">
              © 2025 EuroMillions AI Predictor. For entertainment purposes only.
            </p>
            <div className="mt-4 sm:mt-0 text-sm text-slate-500 dark:text-slate-500">
              Disclaimer: Lottery outcomes are random. Past performance does not guarantee future results.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}