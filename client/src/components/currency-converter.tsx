import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CurrencyAPI } from "@/lib/currency-api";

export function CurrencyConverter() {
  const [euroAmount, setEuroAmount] = useState<string>("");
  const [zarAmount, setZarAmount] = useState<string>("");
  const currencyAPI = CurrencyAPI.getInstance();

  const { data: exchangeData, isLoading } = useQuery({
    queryKey: ["/api/exchange-rate"],
    queryFn: async () => {
      const response = await fetch('/api/exchange-rate');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for more frequent updates
    retry: 3,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale
  });

  useEffect(() => {
    if (euroAmount && exchangeData) {
      const amount = parseFloat(euroAmount);
      if (!isNaN(amount)) {
        const converted = currencyAPI.convertCurrency(amount, exchangeData.rate);
        setZarAmount(converted.toFixed(2));
      } else {
        setZarAmount("");
      }
    } else {
      setZarAmount("");
    }
  }, [euroAmount, exchangeData, currencyAPI]);

  const handleEuroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setEuroAmount(value);
    }
  };

  const lastUpdated = exchangeData?.lastUpdated ? 
    new Date(exchangeData.lastUpdated).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }) : 
    '--:--';

  return (
    <Card className="data-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary dark:text-primary flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          EUR to ZAR Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="euro-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Euro Amount
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
              €
            </span>
            <Input
              id="euro-amount"
              type="text"
              placeholder="0.00"
              value={euroAmount}
              onChange={handleEuroChange}
              className="pl-8 font-mono bg-white dark:bg-card"
            />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <ArrowUpDown className="w-6 h-6 text-slate-400 dark:text-slate-500" />
        </div>

        <div>
          <Label htmlFor="zar-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            South African Rand
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
              R
            </span>
            <Input
              id="zar-amount"
              type="text"
              readOnly
              value={zarAmount}
              placeholder="0.00"
              className="pl-8 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Exchange Rate:</span>
            <span className="font-mono font-medium text-foreground">
              1 EUR = {exchangeData?.rate || 21.01} ZAR
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-600 dark:text-slate-400">Last Updated:</span>
            <span className="text-secondary">{lastUpdated}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}