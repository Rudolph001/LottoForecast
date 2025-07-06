import { useQuery } from "@tanstack/react-query";
import { CurrencyAPI } from "@/lib/currency-api";
import { Skeleton } from "@/components/ui/skeleton";

export function JackpotBanner() {
  const currencyAPI = CurrencyAPI.getInstance();

  const { data: jackpotData, isLoading: jackpotLoading } = useQuery({
    queryKey: ["/api/jackpot"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: exchangeRate, isLoading: rateLoading } = useQuery({
    queryKey: ["/api/exchange-rate"],
    refetchInterval: 60000, // Refresh every minute
  });

  if (jackpotLoading || rateLoading) {
    return (
      <div className="bg-gradient-to-r from-gold to-yellow-500 rounded-xl p-6 mb-8 text-white dark:from-gold dark:to-yellow-600">
        <Skeleton className="h-8 w-64 mb-4 bg-white/20" />
        <Skeleton className="h-12 w-48 bg-white/20" />
      </div>
    );
  }

  const convertedAmount = exchangeRate ? 
    currencyAPI.convertCurrency(jackpotData?.amount || 74000000, exchangeRate.rate) : 
    1554600000;

  const nextDrawDate = jackpotData?.nextDrawDate ? 
    new Date(jackpotData.nextDrawDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 
    'Friday, July 11, 2025';

  return (
    <div className="bg-gradient-to-r from-gold to-yellow-500 dark:from-gold dark:to-yellow-600 rounded-xl p-6 mb-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black dark:bg-black opacity-10 dark:opacity-20"></div>
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Current EuroMillions Jackpot</h2>
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-mono font-bold">
                {currencyAPI.formatCurrency(jackpotData?.amount || 74000000, 'EUR')}
              </span>
              <div className="text-sm opacity-90">
                <div>Next Draw: {nextDrawDate}</div>
                <div>21:05 CET</div>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <div className="text-sm opacity-90 mb-1">ZAR Equivalent</div>
            <div className="text-2xl font-mono font-bold">
              R {convertedAmount.toLocaleString()}
            </div>
            <div className="text-xs opacity-75">
              Rate: 1 EUR = {exchangeRate?.rate || 21.01} ZAR
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
