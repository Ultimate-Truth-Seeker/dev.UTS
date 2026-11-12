/**
 * In-browser re-implementation of the quant-mcp tools (TypeScript port of servers/quant_mcp/metrics.py).
 * The price history is SYNTHETIC: geometric Brownian motion with a shared market factor, like the
 * original generator, but drawn from a different random stream than NumPy's, so the exact numbers
 * differ from a Python run.
 */

export const TRADING_DAYS_PER_YEAR = 252;
const HISTORY_DAYS = 504;
const MARKET_FACTOR_WEIGHT = 0.45;

// [ticker, start price, annual drift, annual volatility]
const UNIVERSE: [string, number, number, number][] = [
  ['AAPL', 180, 0.14, 0.28],
  ['MSFT', 340, 0.16, 0.24],
  ['NVDA', 480, 0.35, 0.55],
  ['GOOGL', 140, 0.13, 0.3],
  ['AMZN', 145, 0.15, 0.33],
  ['JPM', 155, 0.1, 0.22],
  ['XOM', 105, 0.07, 0.26],
  ['KO', 60, 0.06, 0.15],
  ['SPY', 460, 0.1, 0.16],
  ['TLT', 95, 0.03, 0.13],
];

export interface Position {
  ticker: string;
  quantity: number;
}

/* ───────── deterministic random numbers ───────── */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalGenerator(rand: () => number) {
  return () => {
    const u = Math.max(rand(), 1e-12);
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

/* ───────── data ───────── */

const prices: Record<string, number[]> = (() => {
  const rand = mulberry32(42);
  const randn = normalGenerator(rand);
  const market = Array.from({ length: HISTORY_DAYS }, randn);
  const idioWeight = Math.sqrt(1 - MARKET_FACTOR_WEIGHT ** 2);
  const out: Record<string, number[]> = {};
  for (const [ticker, start, drift, vol] of UNIVERSE) {
    const dDrift = drift / HISTORY_DAYS;
    const dVol = vol / Math.sqrt(HISTORY_DAYS);
    let logP = Math.log(start);
    const series: number[] = [];
    for (let i = 0; i < HISTORY_DAYS; i++) {
      const shock = MARKET_FACTOR_WEIGHT * market[i] + idioWeight * randn();
      logP += dDrift + dVol * shock;
      series.push(Math.exp(logP));
    }
    out[ticker] = series;
  }
  return out;
})();

export const availableTickers = (): string[] => UNIVERSE.map((u) => u[0]).sort();

/* ───────── statistics helpers ───────── */

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

function std(xs: number[]): number {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
}

/** numpy.percentile with linear interpolation. */
function percentile(xs: number[], p: number): number {
  const s = [...xs].sort((a, b) => a - b);
  const idx = (p / 100) * (s.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

/** Inverse normal CDF (Acklam's rational approximation, |error| < 1.2e-9). */
export function normPpf(p: number): number {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - plow) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/* ───────── portfolio maths (mirrors metrics.py) ───────── */

export class ToolError extends Error {}

function assertTicker(t: string): string {
  const u = t.toUpperCase();
  if (!prices[u]) throw new ToolError(`No price data for ticker '${t}'. Available tickers: ${availableTickers().join(', ')}`);
  return u;
}

function dailyReturns(ticker: string, windowDays?: number): number[] {
  let p = prices[assertTicker(ticker)];
  if (windowDays) p = p.slice(-(windowDays + 1));
  const r: number[] = [];
  for (let i = 1; i < p.length; i++) r.push(p[i] / p[i - 1] - 1);
  return r;
}

function weights(positions: Position[]): Record<string, number> {
  const values: Record<string, number> = {};
  let total = 0;
  for (const p of positions) {
    const t = assertTicker(p.ticker);
    const v = p.quantity * prices[t][prices[t].length - 1];
    values[t] = (values[t] ?? 0) + v;
    total += v;
  }
  if (total <= 0) throw new ToolError('Portfolio has zero or negative total value.');
  for (const t of Object.keys(values)) values[t] /= total;
  return values;
}

function portfolioReturns(positions: Position[], windowDays?: number): number[] {
  const w = weights(positions);
  const tickers = Object.keys(w);
  const rets = tickers.map((t) => dailyReturns(t, windowDays));
  const n = Math.min(...rets.map((r) => r.length));
  if (n < 2) throw new ToolError('Not enough data points.');
  return Array.from({ length: n }, (_, i) => tickers.reduce((acc, t, k) => acc + w[t] * rets[k][i], 0));
}

const annVol = (r: number[]) => std(r) * Math.sqrt(TRADING_DAYS_PER_YEAR);
const annRet = (r: number[]) => (1 + mean(r)) ** TRADING_DAYS_PER_YEAR - 1;

function sharpe(r: number[], rf: number): number {
  const ex = r.map((x) => x - rf / TRADING_DAYS_PER_YEAR);
  const s = std(ex);
  return s === 0 ? NaN : (mean(ex) / s) * Math.sqrt(TRADING_DAYS_PER_YEAR);
}

function summary(positions: Position[], rf: number, windowDays?: number) {
  const r = portfolioReturns(positions, windowDays);
  return {
    weights: weights(positions),
    annualized_return: annRet(r),
    annualized_volatility: annVol(r),
    sharpe_ratio: sharpe(r, rf),
    num_observations: r.length,
  };
}

function correlation(a: number[], b: number[]): number {
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return num / Math.sqrt(da * db);
}

/* ───────── tools ───────── */

type Args = Record<string, unknown>;

const pos = (v: unknown): Position[] => {
  if (!Array.isArray(v) || v.length === 0) throw new ToolError("Each position must be an object with 'ticker' (string) and 'quantity' (number) fields.");
  return v.map((p) => {
    const o = p as { ticker?: unknown; quantity?: unknown };
    if (typeof o.ticker !== 'string' || typeof o.quantity !== 'number') {
      throw new ToolError("Each position must be an object with 'ticker' (string) and 'quantity' (number) fields.");
    }
    return { ticker: o.ticker.toUpperCase(), quantity: o.quantity };
  });
};
const num = (v: unknown, d: number) => (typeof v === 'number' ? v : d);
const win = (v: unknown) => (typeof v === 'number' ? v : undefined);

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: { type: 'object'; properties: Record<string, unknown>; required?: string[] };
  call: (args: Args) => unknown;
}

const positionsSchema = { type: 'array', items: { type: 'object', properties: { ticker: { type: 'string' }, quantity: { type: 'number' } } } };

export const tools: ToolDef[] = [
  {
    name: 'list_available_tickers',
    description: 'List the tickers for which historical price data is available.',
    inputSchema: { type: 'object', properties: {} },
    call: () => ({ tickers: availableTickers() }),
  },
  {
    name: 'get_portfolio_summary',
    description: 'Headline metrics: weights, annualized return, volatility and Sharpe ratio.',
    inputSchema: { type: 'object', properties: { positions: positionsSchema, risk_free_rate: { type: 'number' }, window_days: { type: 'integer' } }, required: ['positions'] },
    call: (a) => summary(pos(a.positions), num(a.risk_free_rate, 0.02), win(a.window_days)),
  },
  {
    name: 'calculate_volatility',
    description: 'Annualized volatility of the portfolio and of each position (std * sqrt(252)).',
    inputSchema: { type: 'object', properties: { positions: positionsSchema, window_days: { type: 'integer' } }, required: ['positions'] },
    call: (a) => {
      const p = pos(a.positions);
      return {
        portfolio_volatility: annVol(portfolioReturns(p, win(a.window_days))),
        per_ticker_volatility: Object.fromEntries(p.map((x) => [x.ticker, annVol(dailyReturns(x.ticker, win(a.window_days)))])),
      };
    },
  },
  {
    name: 'calculate_sharpe_ratio',
    description: 'Annualized Sharpe ratio of the portfolio from historical daily returns.',
    inputSchema: { type: 'object', properties: { positions: positionsSchema, risk_free_rate: { type: 'number' }, window_days: { type: 'integer' } }, required: ['positions'] },
    call: (a) => {
      const r = portfolioReturns(pos(a.positions), win(a.window_days));
      const rf = num(a.risk_free_rate, 0.02);
      return { sharpe_ratio: sharpe(r, rf), risk_free_rate_used: rf, num_observations: r.length };
    },
  },
  {
    name: 'calculate_var',
    description: '1-day Value at Risk, historical or parametric.',
    inputSchema: {
      type: 'object',
      properties: { positions: positionsSchema, confidence: { type: 'number' }, portfolio_value: { type: 'number' }, method: { type: 'string', enum: ['historical', 'parametric'] }, window_days: { type: 'integer' } },
      required: ['positions'],
    },
    call: (a) => {
      const method = typeof a.method === 'string' ? a.method : 'historical';
      if (method !== 'historical' && method !== 'parametric') throw new ToolError("method must be 'historical' or 'parametric'");
      const conf = num(a.confidence, 0.95);
      if (!(conf > 0 && conf < 1)) throw new ToolError('confidence must be between 0 and 1');
      const value = num(a.portfolio_value, 100000);
      const r = portfolioReturns(pos(a.positions), win(a.window_days));
      const v =
        method === 'historical'
          ? Math.max(-percentile(r, (1 - conf) * 100), 0) * value
          : Math.max(-(mean(r) + normPpf(1 - conf) * std(r)), 0) * value;
      return {
        value_at_risk: v,
        confidence: conf,
        method,
        portfolio_value: value,
        interpretation: `With ${(conf * 100).toFixed(0)}% confidence, the portfolio is not expected to lose more than ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in a single day, based on ${r.length} historical daily observations.`,
      };
    },
  },
  {
    name: 'get_correlation_matrix',
    description: 'Pearson correlation matrix of daily returns plus the most correlated pairs.',
    inputSchema: { type: 'object', properties: { tickers: { type: 'array', items: { type: 'string' } }, window_days: { type: 'integer' }, top_n_pairs: { type: 'integer' } }, required: ['tickers'] },
    call: (a) => {
      if (!Array.isArray(a.tickers) || a.tickers.length < 2) throw new ToolError('Provide at least two tickers.');
      const ts = (a.tickers as string[]).map((t) => assertTicker(t));
      const rets = ts.map((t) => dailyReturns(t, win(a.window_days)));
      const matrix: Record<string, Record<string, number>> = {};
      const pairs: { ticker_a: string; ticker_b: string; correlation: number }[] = [];
      ts.forEach((ta, i) => {
        matrix[ta] = {};
        ts.forEach((tb, j) => {
          const c = i === j ? 1 : correlation(rets[i], rets[j]);
          matrix[ta][tb] = Math.round(c * 1e4) / 1e4;
          if (j > i) pairs.push({ ticker_a: ta, ticker_b: tb, correlation: c });
        });
      });
      pairs.sort((x, y) => Math.abs(y.correlation) - Math.abs(x.correlation));
      return { correlation_matrix: matrix, most_correlated_pairs: pairs.slice(0, num(a.top_n_pairs, 3)) };
    },
  },
  {
    name: 'simulate_rebalance',
    description: 'What-if comparison of metrics before and after a proposed change. No trade is executed.',
    inputSchema: {
      type: 'object',
      properties: { current_positions: positionsSchema, proposed_positions: positionsSchema, risk_free_rate: { type: 'number' }, window_days: { type: 'integer' } },
      required: ['current_positions', 'proposed_positions'],
    },
    call: (a) => {
      const rf = num(a.risk_free_rate, 0.02);
      const before = summary(pos(a.current_positions), rf, win(a.window_days));
      const after = summary(pos(a.proposed_positions), rf, win(a.window_days));
      return {
        before,
        after,
        delta: {
          annualized_return: after.annualized_return - before.annualized_return,
          annualized_volatility: after.annualized_volatility - before.annualized_volatility,
          sharpe_ratio: after.sharpe_ratio - before.sharpe_ratio,
        },
      };
    },
  },
];
