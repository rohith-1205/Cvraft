/**
 * pricing.js — Cvraft Localized Pricing Utility
 *
 * ARCHITECTURE:
 * - Country is detected once via ipapi.co and cached in localStorage.
 * - Pricing cards display a localized currency (USD, GBP, EUR, INR, etc.)
 *   based on detected country for a better UX.
 * - Razorpay ALWAYS receives INR (Indian Rupees) in paise internally,
 *   regardless of what display currency is shown. The exchange is cosmetic.
 * - This keeps the payment processing backend simple and Razorpay-compatible.
 *
 * TO ADD A NEW COUNTRY:
 * 1. Add a new entry to COUNTRY_PRICING below.
 * 2. Add the ISO 3166-1 alpha-2 country code as the key.
 * 3. Specify currency code (ISO 4217), and localized amounts.
 */

const CACHE_KEY = 'cvraft_detected_country';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * COUNTRY_PRICING — Localized display pricing per country group.
 *
 * Keys are ISO 3166-1 alpha-2 country codes.
 * amounts are for display only — Razorpay always charges in INR.
 * inrPaise fields are the actual values sent to Razorpay (in paise).
 */
export const COUNTRY_PRICING = {
  // India — INR (native, no conversion needed)
  IN: {
    currency: 'INR',
    locale: 'en-IN',
    symbol: '₹',
    plans: {
      basic:  { displayAmount: 149,  inrPaise: 14900 },
      pro:    { displayAmount: 249,  inrPaise: 24900 },
      bundle: { displayAmount: 349,  inrPaise: 34900 },
    },
  },

  // United States — USD
  US: {
    currency: 'USD',
    locale: 'en-US',
    symbol: '$',
    plans: {
      basic:  { displayAmount: 1.99, inrPaise: 14900 },
      pro:    { displayAmount: 3.99, inrPaise: 24900 },
      bundle: { displayAmount: 5.99, inrPaise: 34900 },
    },
  },

  // United Kingdom — GBP
  GB: {
    currency: 'GBP',
    locale: 'en-GB',
    symbol: '£',
    plans: {
      basic:  { displayAmount: 1.49, inrPaise: 14900 },
      pro:    { displayAmount: 2.99, inrPaise: 24900 },
      bundle: { displayAmount: 4.49, inrPaise: 34900 },
    },
  },

  // Australia — AUD
  AU: {
    currency: 'AUD',
    locale: 'en-AU',
    symbol: 'A$',
    plans: {
      basic:  { displayAmount: 2.49, inrPaise: 14900 },
      pro:    { displayAmount: 4.49, inrPaise: 24900 },
      bundle: { displayAmount: 6.99, inrPaise: 34900 },
    },
  },

  // Canada — CAD
  CA: {
    currency: 'CAD',
    locale: 'en-CA',
    symbol: 'C$',
    plans: {
      basic:  { displayAmount: 2.29, inrPaise: 14900 },
      pro:    { displayAmount: 4.29, inrPaise: 24900 },
      bundle: { displayAmount: 6.49, inrPaise: 34900 },
    },
  },

  // Singapore — SGD
  SG: {
    currency: 'SGD',
    locale: 'en-SG',
    symbol: 'S$',
    plans: {
      basic:  { displayAmount: 2.29, inrPaise: 14900 },
      pro:    { displayAmount: 4.29, inrPaise: 24900 },
      bundle: { displayAmount: 6.49, inrPaise: 34900 },
    },
  },

  // UAE — AED
  AE: {
    currency: 'AED',
    locale: 'ar-AE',
    symbol: 'د.إ',
    plans: {
      basic:  { displayAmount: 5.99, inrPaise: 14900 },
      pro:    { displayAmount: 11.99, inrPaise: 24900 },
      bundle: { displayAmount: 17.99, inrPaise: 34900 },
    },
  },
};

/**
 * European country codes that share the EUR pricing tier.
 */
const EURO_COUNTRIES = [
  'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'FI', 'SE',
  'NO', 'DK', 'CH', 'PL', 'CZ', 'HU', 'RO', 'GR', 'IE', 'LU',
  'SK', 'SI', 'HR', 'BG', 'EE', 'LV', 'LT', 'MT', 'CY',
];

// EUR pricing definition (used for all EURO_COUNTRIES)
const EUR_PRICING = {
  currency: 'EUR',
  locale: 'de-DE',
  symbol: '€',
  plans: {
    basic:  { displayAmount: 1.79, inrPaise: 14900 },
    pro:    { displayAmount: 3.49, inrPaise: 24900 },
    bundle: { displayAmount: 5.29, inrPaise: 34900 },
  },
};

/**
 * Fallback pricing used when geolocation API fails or country is unknown.
 * Defaults to INR.
 */
export const FALLBACK_PRICING = COUNTRY_PRICING.IN;

/**
 * Resolves the pricing config for a given country code.
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {object} pricing config
 */
export function getPricingForCountry(countryCode) {
  if (!countryCode) return FALLBACK_PRICING;
  const code = countryCode.toUpperCase();
  if (COUNTRY_PRICING[code]) return COUNTRY_PRICING[code];
  if (EURO_COUNTRIES.includes(code)) return EUR_PRICING;
  // Unknown country — fall back to INR
  return FALLBACK_PRICING;
}

/**
 * Formats a display amount using Intl.NumberFormat for proper locale-aware
 * currency formatting (e.g. "€3.49" or "₹249").
 *
 * @param {number} amount - the display amount (not in paise)
 * @param {string} currency - ISO 4217 currency code (e.g. 'INR', 'USD')
 * @param {string} locale - BCP 47 locale string (e.g. 'en-IN', 'en-US')
 * @returns {string} formatted currency string
 */
export function formatPrice(amount, currency, locale) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'INR' ? 0 : 2,
      maximumFractionDigits: currency === 'INR' ? 0 : 2,
    }).format(amount);
  } catch {
    // Graceful fallback if Intl is not available
    return `${amount} ${currency}`;
  }
}

/**
 * Detects user's country using ipapi.co with localStorage caching.
 * Cache TTL is 24 hours so we don't spam the API.
 *
 * Returns country code (e.g. "US", "IN") or null if detection fails.
 * @returns {Promise<string|null>}
 */
export async function detectCountry() {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { code, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      if (age < CACHE_TTL_MS && code) {
        return code; // Cache hit — return immediately
      }
    }
  } catch {
    // Corrupt cache — ignore and re-fetch
  }

  // Fetch from ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000) // 5s timeout
    });
    if (!res.ok) throw new Error('ipapi response not ok');
    const data = await res.json();
    const code = data.country_code || null;

    if (code) {
      // Cache result with timestamp
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        code,
        timestamp: Date.now()
      }));
    }
    return code;
  } catch {
    // Network error or timeout — return null to trigger fallback
    return null;
  }
}

/**
 * React hook that detects country and returns the correct pricing config.
 * Caches result and avoids re-fetching on every render.
 *
 * Usage:
 *   const { pricing, isLoading } = usePricing();
 *   const planPrice = pricing.plans.pro.displayAmount;
 */
import { useState, useEffect } from 'react';

export function usePricing() {
  const [pricing, setPricing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countryCode, setCountryCode] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const code = await detectCountry();
      if (!cancelled) {
        const resolved = getPricingForCountry(code);
        setPricing(resolved);
        setCountryCode(code);
        setIsLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // While loading, return fallback so UI isn't blocked
  return {
    pricing: pricing || FALLBACK_PRICING,
    isLoading,
    countryCode,
  };
}
