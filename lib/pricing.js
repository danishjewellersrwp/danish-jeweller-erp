export const TOLA_GRAMS = 11.6638125;
export const OZ_TO_GRAM = 31.1034768;

export const PURITIES = [
  { id: 'g24', metal: 'gold', label: '24K', factor: 1.0 },
  { id: 'g22', metal: 'gold', label: '22K', factor: 22 / 24 },
  { id: 'g21', metal: 'gold', label: '21K', factor: 21 / 24 },
  { id: 'g18', metal: 'gold', label: '18K', factor: 18 / 24 },
  { id: 'g14', metal: 'gold', label: '14K', factor: 14 / 24 },
  { id: 's999', metal: 'silver', label: 'Silver 999', factor: 0.999 },
  { id: 's925', metal: 'silver', label: 'Silver 925', factor: 0.925 },
  { id: 's900', metal: 'silver', label: 'Silver 900', factor: 0.900 },
];
export const getPurity = (id) => PURITIES.find(p => p.id === id) || PURITIES[0];

export function ratePerGram(purityId, metalRates) {
  const p = getPurity(purityId);
  const base = p.metal === 'gold' ? metalRates.gold_pure_per_gram : metalRates.silver_pure_per_gram;
  return base * p.factor;
}

// Every price shown in the app runs through this one function.
export function priceBreakdown({ grossWeight = 0, stoneWeight = 0, purityId, metalRates,
  wastageType = 'percent', wastageValue = 0, makingType = 'per_gram', makingValue = 0,
  stoneValue = 0, otherCharges = 0, discount = 0, taxPercent = 0 }) {
  const rate = ratePerGram(purityId, metalRates);
  const netWeight = Math.max(0, grossWeight - stoneWeight);
  const metalValue = netWeight * rate;
  const wastageAmount = wastageType === 'percent' ? metalValue * (wastageValue / 100)
    : wastageType === 'grams' ? wastageValue * rate
    : wastageValue;
  const makingCharge = makingType === 'per_gram' ? netWeight * makingValue
    : makingType === 'percent' ? metalValue * (makingValue / 100)
    : makingValue;
  const subtotal = metalValue + wastageAmount + makingCharge + Number(stoneValue || 0) + Number(otherCharges || 0);
  const afterDiscount = Math.max(0, subtotal - Number(discount || 0));
  const tax = afterDiscount * (taxPercent / 100);
  const total = afterDiscount + tax;
  return { rate, netWeight, metalValue, wastageAmount, makingCharge, stoneValue: Number(stoneValue || 0),
    otherCharges: Number(otherCharges || 0), subtotal, discount: Number(discount || 0), tax, total };
}

export const fmt = (n, cur = 'PKR') => `${cur} ${Math.round(Number(n || 0)).toLocaleString('en-US')}`;
export const fmtW = (n) => `${Number(n || 0).toFixed(2)} g`;
export const todayISO = () => new Date().toISOString().slice(0, 10);

// Live metal-rate feed — same free, CORS-enabled, no-key commodities API used
// in the prototype. Real market data, with graceful fallback baked in by the
// caller (it never overwrites a good rate on failure).
export async function fetchLiveSpotUsdPerOz(symbol) {
  const url = `https://aurumrates.com/api/chart?symbol=${encodeURIComponent(symbol)}&range=5d&interval=15m`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`Provider returned HTTP ${res.status}`);
    const rawText = await res.text();
    let json;
    try {
      json = JSON.parse(rawText);
    } catch (parseErr) {
      console.error(`[${symbol}] Response was not valid JSON. First 500 chars:`, rawText.slice(0, 500));
      throw new Error('Provider response was not valid JSON');
    }
    if (typeof json?.regularMarketPrice === 'number') {
      return json.regularMarketPrice;
    }
    const closes = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
    for (let i = closes.length - 1; i >= 0; i--) {
      if (closes[i] != null) return closes[i];
    }
    console.error(`[${symbol}] No usable price data. Raw response (first 800 chars):`, rawText.slice(0, 800));
    throw new Error('Provider response had no usable price data');
  } finally {
    clearTimeout(timer);
  }
}
export async function fetchLiveMetalRates() {
  try {
    const [goldUsdOz, silverUsdOz] = await Promise.all([
      fetchLiveSpotUsdPerOz('GC=F'),
      fetchLiveSpotUsdPerOz('SI=F'),
    ]);
    return { goldUsdOz, silverUsdOz };
  } catch (e) {
    console.error('Live metal rate fetch failed:', e);
    throw new Error(`Live rate fetch failed: ${e.name === 'AbortError' ? 'request timed out after 15s' : e.message}`);
  }
}