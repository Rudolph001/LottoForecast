import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Home, 
  Car, 
  TrendingUp, 
  Banknote,
  ShoppingBag,
  Wallet
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface BudgetAllocation {
  investecFixedDeposit: number;
  houses: number;
  cars: number;
  otherExpenses: number;
}

interface TaxCalculation {
  monthlyInterest: number;
  annualInterest: number;
  taxableAmount: number;
  taxOwed: number;
  netMonthlyIncome: number;
}

interface ExchangeRateData {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

export function BudgetDashboard() {
  const [jackpotAmount, setJackpotAmount] = useState<string>("74000000");
  const [interestRate, setInterestRate] = useState<string>("10.5");
  const [allocation, setAllocation] = useState<BudgetAllocation>({
    investecFixedDeposit: 60,
    houses: 25,
    cars: 10,
    otherExpenses: 5
  });

  const { data: exchangeRate } = useQuery<ExchangeRateData>({
    queryKey: ["/api/exchange-rate"],
    refetchInterval: 60000,
  });

  const jackpotEUR = parseFloat(jackpotAmount) || 0;
  const jackpotZAR = exchangeRate ? jackpotEUR * exchangeRate.rate : jackpotEUR * 20.71;
  const rate = parseFloat(interestRate) || 0;

  // Calculate allocations
  const investmentAmount = (jackpotZAR * allocation.investecFixedDeposit) / 100;
  const housesAmount = (jackpotZAR * allocation.houses) / 100;
  const carsAmount = (jackpotZAR * allocation.cars) / 100;
  const otherAmount = (jackpotZAR * allocation.otherExpenses) / 100;

  // Calculate tax on interest (South African tax rates 2024/25)
  const calculateTax = (): TaxCalculation => {
    const monthlyInterest = (investmentAmount * rate) / 100 / 12;
    const annualInterest = monthlyInterest * 12;
    
    // SA tax brackets 2024/25 (simplified for interest income)
    let taxRate = 0;
    if (annualInterest <= 237100) taxRate = 0.18;
    else if (annualInterest <= 370500) taxRate = 0.26;
    else if (annualInterest <= 512800) taxRate = 0.31;
    else if (annualInterest <= 673000) taxRate = 0.36;
    else if (annualInterest <= 857900) taxRate = 0.39;
    else if (annualInterest <= 1817000) taxRate = 0.41;
    else taxRate = 0.45;

    const taxOwed = annualInterest * taxRate;
    const netMonthlyIncome = monthlyInterest - (taxOwed / 12);

    return {
      monthlyInterest,
      annualInterest,
      taxableAmount: annualInterest,
      taxOwed,
      netMonthlyIncome
    };
  };

  const taxCalc = calculateTax();

  const handleAllocationChange = (category: keyof BudgetAllocation, value: string) => {
    const numValue = parseFloat(value) || 0;
    setAllocation(prev => ({ ...prev, [category]: numValue }));
  };

  const totalAllocation = Object.values(allocation).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary dark:text-primary">Budget Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">Jackpot Investment & Expense Planning</p>
        </div>
        <Badge variant={totalAllocation === 100 ? "default" : "destructive"} className="px-3 py-1">
          <Calculator className="h-4 w-4 mr-2" />
          {totalAllocation}% Allocated
        </Badge>
      </div>

      {/* Jackpot Input */}
      <Card className="data-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary dark:text-primary flex items-center">
            <Banknote className="w-5 h-5 mr-2" />
            Jackpot Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jackpot-eur">Jackpot (EUR)</Label>
              <Input
                id="jackpot-eur"
                type="text"
                value={jackpotAmount}
                onChange={(e) => setJackpotAmount(e.target.value)}
                className="font-mono"
                placeholder="74000000"
              />
            </div>
            <div>
              <Label htmlFor="interest-rate">Fixed Deposit Rate (%)</Label>
              <Input
                id="interest-rate"
                type="text"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="font-mono"
                placeholder="10.5"
              />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gold/10 to-yellow-500/10 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary dark:text-primary">
                  €{jackpotEUR.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Jackpot EUR</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gold">
                  R{jackpotZAR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Jackpot ZAR (Rate: {exchangeRate?.rate.toFixed(2) || '20.71'})
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Budget Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
        {/* Fixed Deposit Card */}
        <Card className="data-card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-green-700 dark:text-green-400 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Fixed Deposit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="investec-percent" className="text-sm">Percentage</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="investec-percent"
                  type="number"
                  value={allocation.investecFixedDeposit}
                  onChange={(e) => handleAllocationChange('investecFixedDeposit', e.target.value)}
                  className="font-mono"
                  min="0"
                  max="100"
                />
                <span className="text-slate-500 dark:text-slate-400">%</span>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                R{investmentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {allocation.investecFixedDeposit}% of jackpot
              </div>
            </div>
            
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Monthly Interest:</span>
                <span className="font-semibold">R{taxCalc.monthlyInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">After Tax:</span>
                <span className="font-semibold text-green-600">R{taxCalc.netMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Account Card */}
        <Card className="data-card bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Main Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                R{taxCalc.netMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Net monthly income
              </div>
            </div>
            
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Gross Monthly:</span>
                <span className="font-semibold">R{taxCalc.monthlyInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Monthly Tax:</span>
                <span className="font-semibold text-red-600">-R{(taxCalc.taxOwed / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Annual Income:</span>
                <span className="font-semibold">R{(taxCalc.netMonthlyIncome * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="account-details" className="text-xs">Account Details</Label>
              <Input
                id="account-details"
                placeholder="e.g., Main spending account"
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Houses/Property Card */}
        <Card className="data-card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-blue-700 dark:text-blue-400 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Houses/Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="houses-percent" className="text-sm">Percentage</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="houses-percent"
                  type="number"
                  value={allocation.houses}
                  onChange={(e) => handleAllocationChange('houses', e.target.value)}
                  className="font-mono"
                  min="0"
                  max="100"
                />
                <span className="text-slate-500 dark:text-slate-400">%</span>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                R{housesAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {allocation.houses}% of jackpot
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="property-details" className="text-xs">Property Details</Label>
              <Input
                id="property-details"
                placeholder="e.g., 3 bedroom house, Cape Town"
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cars/Vehicles Card */}
        <Card className="data-card bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-400 flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Cars/Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="cars-percent" className="text-sm">Percentage</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="cars-percent"
                  type="number"
                  value={allocation.cars}
                  onChange={(e) => handleAllocationChange('cars', e.target.value)}
                  className="font-mono"
                  min="0"
                  max="100"
                />
                <span className="text-slate-500 dark:text-slate-400">%</span>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                R{carsAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {allocation.cars}% of jackpot
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="car-details" className="text-xs">Vehicle Details</Label>
              <Input
                id="car-details"
                placeholder="e.g., BMW X5, Mercedes C-Class"
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Other Expenses Card */}
        <Card className="data-card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-orange-700 dark:text-orange-400 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Other Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="other-percent" className="text-sm">Percentage</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="other-percent"
                  type="number"
                  value={allocation.otherExpenses}
                  onChange={(e) => handleAllocationChange('otherExpenses', e.target.value)}
                  className="font-mono"
                  min="0"
                  max="100"
                />
                <span className="text-slate-500 dark:text-slate-400">%</span>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                R{otherAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {allocation.otherExpenses}% of jackpot
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="other-details" className="text-xs">Expense Details</Label>
              <Input
                id="other-details"
                placeholder="e.g., Travel, Charity, Family"
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Summary */}
      <Card className="data-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary dark:text-primary flex items-center justify-between">
            <span className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Allocation Summary
            </span>
            <Badge variant={totalAllocation === 100 ? "default" : "destructive"} className="px-3 py-1">
              {totalAllocation}% Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Allocation:</span>
              <span className={totalAllocation === 100 ? "text-green-600" : "text-red-600"}>
                {totalAllocation}%
              </span>
            </div>
            {totalAllocation !== 100 && (
              <div className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ Allocation must total 100%
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}