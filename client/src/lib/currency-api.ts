export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

export interface JackpotData {
  amount: number;
  currency: string;
  nextDrawDate: string;
  drawNumber: number;
}

export class CurrencyAPI {
  private static instance: CurrencyAPI;
  
  public static getInstance(): CurrencyAPI {
    if (!CurrencyAPI.instance) {
      CurrencyAPI.instance = new CurrencyAPI();
    }
    return CurrencyAPI.instance;
  }

  async getExchangeRate(): Promise<ExchangeRate> {
    try {
      const response = await fetch('/api/exchange-rate');
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Fallback rate
      return {
        from: "EUR",
        to: "ZAR",
        rate: 21.01,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async getJackpotData(): Promise<JackpotData> {
    try {
      const response = await fetch('/api/jackpot');
      if (!response.ok) {
        throw new Error('Failed to fetch jackpot data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching jackpot data:', error);
      // Fallback data based on search results
      return {
        amount: 74000000,
        currency: "EUR",
        nextDrawDate: "2025-07-11T21:05:00.000Z",
        drawNumber: 1852
      };
    }
  }

  convertCurrency(amount: number, rate: number): number {
    return parseFloat((amount * rate).toFixed(2));
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatCurrencyDetailed(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}
