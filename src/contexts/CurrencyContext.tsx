'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Currency = 'USD' | 'BRL';

interface CurrencyContextType {
  currentCurrency: Currency;
  setCurrentCurrency: (currency: Currency) => void;
  convertPrice: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
  exchangeRate: number | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const API_KEY = 'fca_live_lXAXvbur0rPnZgVO3Lmj9J6e0V1nFgBRWA3MUx18';
const BASE_URL = 'https://api.freecurrencyapi.com/v1';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>('USD');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  useEffect(() => {
    async function fetchExchangeRate() {
      try {
        const response = await fetch(
          `${BASE_URL}/latest?apikey=${API_KEY}&currencies=BRL&base_currency=USD`
        );
        const data = await response.json();
        setExchangeRate(data.data.BRL);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      }
    }

    fetchExchangeRate();
    // Fetch exchange rate every hour
    const interval = setInterval(fetchExchangeRate, 3600000);

    return () => clearInterval(interval);
  }, []);

  const convertPrice = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (!exchangeRate || fromCurrency === toCurrency) return amount;

    if (fromCurrency === 'USD' && toCurrency === 'BRL') {
      return amount * exchangeRate;
    } else {
      return amount / exchangeRate;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrentCurrency,
        convertPrice,
        exchangeRate,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
} 