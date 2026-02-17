import type { AssetType } from '@/lib/types';

/**
 * Detects the asset type based on ticker format
 *
 * Rules:
 * - B3 FII: Tickers ending with "11" (e.g., MXRF11, HGLG11)
 * - B3 Stock: Tickers ending with 3-9 or 10-12 (e.g., PETR4, VALE3)
 * - Crypto: Known cryptocurrency symbols (BTC, ETH, SOL, etc.)
 * - US Stock: Default for all other tickers (e.g., AAPL, MSFT)
 */
export function detectAssetType(ticker: string): AssetType {
  const normalized = ticker.toUpperCase().trim();

  // B3 FII: ends with 11
  if (/[A-Z]{4}11$/.test(normalized)) {
    return 'B3_FII';
  }

  // B3 Stock: ends with 3-9 or 10-12
  if (/[A-Z]{4}[3-9]$/.test(normalized) || /[A-Z]{4}1[0-2]$/.test(normalized)) {
    return 'B3_STOCK';
  }

  // Common cryptocurrency symbols
  const cryptoSymbols = [
    'BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'DOT', 'MATIC', 'AVAX', 'LINK',
    'UNI', 'ATOM', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'ICP', 'FIL', 'SAND',
    'MANA', 'AXS', 'THETA', 'EGLD', 'AAVE', 'EOS', 'CAKE', 'GRT', 'RUNE', 'FTM'
  ];

  if (cryptoSymbols.includes(normalized)) {
    return 'CRYPTO';
  }

  // Default to US stock
  return 'US_STOCK';
}
