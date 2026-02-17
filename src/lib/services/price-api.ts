import type { AssetType } from '@/lib/types';

export interface PriceData {
  price: number;
  source: string;
  timestamp: string;
}

export interface PriceApiError {
  error: string;
  ticker: string;
  type: AssetType;
}

// In-memory rate limiting state
const rateLimits: Map<string, number> = new Map();

/**
 * Check if we can make an API call, respecting rate limits
 */
function checkRateLimit(source: string, limitMs: number): boolean {
  const lastCall = rateLimits.get(source) || 0;
  const now = Date.now();

  if (now - lastCall < limitMs) {
    return false; // Rate limited
  }

  rateLimits.set(source, now);
  return true;
}

/**
 * Wait until rate limit allows next request
 */
async function waitForRateLimit(source: string, limitMs: number): Promise<void> {
  const lastCall = rateLimits.get(source) || 0;
  const now = Date.now();
  const timeToWait = limitMs - (now - lastCall);

  if (timeToWait > 0) {
    await new Promise(resolve => setTimeout(resolve, timeToWait));
  }

  rateLimits.set(source, Date.now());
}

/**
 * Fetch price from Brapi (Brazilian stocks and FIIs)
 * Rate limit: 1 request/second (free tier)
 */
async function fetchBrapiPrice(ticker: string): Promise<PriceData> {
  await waitForRateLimit('brapi', 1000);

  const response = await fetch(`https://brapi.dev/api/quote/${ticker}?token=demo`);

  if (!response.ok) {
    throw new Error(`Brapi API error: ${response.status}`);
  }

  const data = await response.json();
  const quote = data.results?.[0];

  if (!quote || typeof quote.regularMarketPrice !== 'number') {
    throw new Error(`No price data available for ${ticker}`);
  }

  return {
    price: quote.regularMarketPrice,
    source: 'Brapi',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch price from Alpha Vantage (US stocks)
 * Rate limit: 5 requests/minute (free tier)
 */
async function fetchAlphaVantagePrice(ticker: string, apiKey: string): Promise<PriceData> {
  if (!apiKey || apiKey === '') {
    throw new Error('Alpha Vantage API key not configured. Please add it in Settings.');
  }

  await waitForRateLimit('alphavantage', 12000); // 12 seconds = 5 req/min

  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.status}`);
  }

  const data = await response.json();
  const quote = data['Global Quote'];

  if (!quote || !quote['05. price']) {
    // Check if it's a rate limit or invalid key error
    if (data['Note']) {
      throw new Error('Alpha Vantage rate limit exceeded. Please wait a minute.');
    }
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage error: ${data['Error Message']}`);
    }
    throw new Error(`No price data available for ${ticker}`);
  }

  return {
    price: parseFloat(quote['05. price']),
    source: 'Alpha Vantage',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch price from CoinGecko (cryptocurrencies)
 * Rate limit: 10-50 requests/minute (free tier)
 */
async function fetchCoinGeckoPrice(ticker: string): Promise<PriceData> {
  await waitForRateLimit('coingecko', 1200); // ~50 req/min

  // Map ticker symbols to CoinGecko IDs
  const coinMap: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'ADA': 'cardano',
    'XRP': 'ripple',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'ATOM': 'cosmos',
    'LTC': 'litecoin',
    'BCH': 'bitcoin-cash',
    'XLM': 'stellar',
    'ALGO': 'algorand',
    'VET': 'vechain',
    'ICP': 'internet-computer',
    'FIL': 'filecoin',
    'SAND': 'the-sandbox',
    'MANA': 'decentraland',
    'AXS': 'axie-infinity',
    'THETA': 'theta-token',
    'EGLD': 'elrond-erd-2',
    'AAVE': 'aave',
    'EOS': 'eos',
    'CAKE': 'pancakeswap-token',
    'GRT': 'the-graph',
    'RUNE': 'thorchain',
    'FTM': 'fantom',
  };

  const coinId = coinMap[ticker.toUpperCase()];
  if (!coinId) {
    throw new Error(`Unknown cryptocurrency ticker: ${ticker}. Please add it manually.`);
  }

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=brl`
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = await response.json();
  const price = data[coinId]?.brl;

  if (typeof price !== 'number') {
    throw new Error(`No price data available for ${ticker}`);
  }

  return {
    price,
    source: 'CoinGecko',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Main function to fetch price based on asset type
 * Returns price data or error object (never throws)
 */
export async function fetchPrice(
  ticker: string,
  assetType: AssetType,
  alphaVantageKey: string
): Promise<PriceData | PriceApiError> {
  try {
    switch (assetType) {
      case 'B3_STOCK':
      case 'B3_FII':
        return await fetchBrapiPrice(ticker);

      case 'US_STOCK':
        return await fetchAlphaVantagePrice(ticker, alphaVantageKey);

      case 'CRYPTO':
        return await fetchCoinGeckoPrice(ticker);

      default:
        throw new Error(`Unknown asset type: ${assetType}`);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      ticker,
      type: assetType,
    };
  }
}
