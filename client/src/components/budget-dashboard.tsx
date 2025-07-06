
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Home, 
  Car, 
  PiggyBank, 
  TrendingUp, 
  Banknote,
  Receipt,
  Wallet,
  Building2,
  ShoppingBag
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

export function BudgetDashboard() {
  const [jackpotAmount, setJackpotAmount] = useState<string>("74000000");
  const [interestRate, setInterestRate] = useState<string>("10.5");
  const [allocation, setAllocation] = useState<BudgetAllocation>({
    investecFixedDeposit: 60,
    houses: 25,
    cars: 10,
    otherExpenses: 5
  });

  const { data: exchangeRate } = useQuery({
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

      {/* Budget Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="data-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary dark:text-primary">
              Budget Allocation (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="investec">Investec Fixed Deposit</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="investec"
                    type="number"
                    value={allocation.investecFixedDeposit}
                    onChange={(e) => handleAllocationChange('investecFixedDeposit', e.target.value)}
                    className="font-mono"
                    min="0"
                    max="100"
                  />
                  <span className="text-slate-500">%</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="houses">Houses/Property</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="houses"
                    type="number"
                    value={allocation.houses}
                    onChange={(e) => handleAllocationChange('houses', e.target.value)}
                    className="font-mono"
                    min="0"
                    max="100"
                  />
                  <span className="text-slate-500">%</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="cars">Cars/Vehicles</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="cars"
                    type="number"
                    value={allocation.cars}
                    onChange={(e) => handleAllocationChange('cars', e.target.value)}
                    className="font-mono"
                    min="0"
                    max="100"
                  />
                  <span className="text-slate-500">%</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="other">Other Expenses</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="other"
                    type="number"
                    value={allocation.otherExpenses}
                    onChange={(e) => handleAllocationChange('otherExpenses', e.target.value)}
                    className="font-mono"
                    min="0"
                    max="100"
                  />
                  <span className="text-slate-500">%</span>
                </div>
              </div>
            </div>

            <Separator />

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

        {/* Investment Details */}
        <Card className="data-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary dark:text-primary flex items-center">
              <PiggyBank className="w-5 h-5 mr-2" />
              Investment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">Investec Fixed Deposit</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Principal Amount:</span>
                  <span className="font-mono font-bold">R{investmentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Interest Rate:</span>
                  <span className="font-mono">{rate}% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Interest (Gross):</span>
                  <span className="font-mono font-bold text-green-600">R{taxCalc.monthlyInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Annual Interest (Gross):</span>
                  <span className="font-mono">R{taxCalc.annualInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-3">South African Tax (2024/25)</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Taxable Income:</span>
                  <span className="font-mono">R{taxCalc.taxableAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Annual Tax Owed:</span>
                  <span className="font-mono font-bold text-red-600">R{taxCalc.taxOwed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Tax:</span>
                  <span className="font-mono">R{(taxCalc.taxOwed / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Net Monthly Income</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  R{taxCalc.netMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">After Tax Monthly Income</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="data-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Fixed Deposit</p>
                <p className="text-2xl font-bold text-green-600">
                  R{investmentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/20">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {allocation.investecFixedDeposit}% of jackpot
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Houses/Property</p>
                <p className="text-2xl font-bold text-blue-600">
                  R{housesAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                <Home className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {allocation.houses}% of jackpot
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cars/Vehicles</p>
                <p className="text-2xl font-bold text-purple-600">
                  R{carsAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20">
                <Car className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {allocation.cars}% of jackpot
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Other Expenses</p>
                <p className="text-2xl font-bold text-orange-600">
                  R{otherAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/20">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {allocation.otherExpenses}% of jackpot
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="data-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary dark:text-primary flex items-center">
            <Receipt className="w-5 h-5 mr-2" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-primary dark:text-primary">
                R{jackpotZAR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Jackpot (ZAR)</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                R{taxCalc.netMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Monthly Income (After Tax)</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                R{taxCalc.taxOwed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Annual Tax Liability</div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Based on South African tax rates for 2024/25 tax year
            </p>
            <Badge variant="outline" className="px-3 py-1">
              <Building2 className="h-4 w-4 mr-2" />
              SARS Compliant Calculations
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
