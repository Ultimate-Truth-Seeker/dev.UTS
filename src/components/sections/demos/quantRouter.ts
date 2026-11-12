import { availableTickers, type Position } from './quantMetrics';
import type { Lang } from '../../../i18n/context';

export const DEFAULT_PORTFOLIO: Position[] = [
  { ticker: 'AAPL', quantity: 100 },
  { ticker: 'MSFT', quantity: 50 },
  { ticker: 'NVDA', quantity: 30 },
  { ticker: 'TLT', quantity: 80 },
];

export interface Plan {
  tool: string;
  args: Record<string, unknown>;
  /** Note shown when the router had to assume something. */
  assumption?: { en: string; es: string };
}

/** Pulls "100 AAPL", "AAPL 100" or "AAPL x100" pairs out of free text; unknown tickers are ignored. */
export function parsePositions(text: string): Position[] {
  const known = new Set(availableTickers());
  const found = new Map<string, number>();
  const a = /(\d+(?:\.\d+)?)\s*(?:x|×|shares?|acciones|de)?\s*([A-Za-z]{2,5})\b/g;
  const b = /\b([A-Za-z]{2,5})\s*(?:[:=x×])?\s*(\d+(?:\.\d+)?)\b/g;
  for (const m of text.matchAll(a)) {
    const t = m[2].toUpperCase();
    if (known.has(t)) found.set(t, Number(m[1]));
  }
  for (const m of text.matchAll(b)) {
    const t = m[1].toUpperCase();
    if (known.has(t) && !found.has(t)) found.set(t, Number(m[2]));
  }
  return [...found].map(([ticker, quantity]) => ({ ticker, quantity }));
}

function mentionedTickers(text: string): string[] {
  const known = availableTickers();
  return known.filter((t) => new RegExp(`\\b${t}\\b`, 'i').test(text));
}

/** A deliberately tiny, rule-based stand-in for the LLM. The real project lets Claude choose the tool. */
export function route(text: string): Plan | null {
  const q = text.toLowerCase();
  const positions = parsePositions(text);
  const current = positions.length > 0 ? positions : DEFAULT_PORTFOLIO;
  const window = /(\d{2,3})\s*(?:d[ií]as|days|d)\b/.exec(q);
  const window_days = window ? Number(window[1]) : undefined;
  const base = window_days ? { window_days } : {};

  if (/tickers?|disponibles|available|which (stocks|assets)|qu[eé] (acciones|activos)/.test(q)) {
    return { tool: 'list_available_tickers', args: {} };
  }
  if (/rebalanc/.test(q)) {
    const parts = text.split(/->|→|\bto\b|\ba\b(?=\s*\d)/i);
    if (parts.length === 2) {
      const from = parsePositions(parts[0]);
      const to = parsePositions(parts[1]);
      if (from.length > 0 && to.length > 0) {
        return { tool: 'simulate_rebalance', args: { current_positions: from, proposed_positions: to, ...base } };
      }
    }
    const riskiest = current.find((p) => p.ticker === 'NVDA') ?? current[0];
    const proposed = current.map((p) =>
      p.ticker === riskiest.ticker ? { ...p, quantity: Math.round(p.quantity / 2) } : p,
    );
    if (!proposed.some((p) => p.ticker === 'TLT')) proposed.push({ ticker: 'TLT', quantity: 100 });
    return {
      tool: 'simulate_rebalance',
      args: { current_positions: current, proposed_positions: proposed, ...base },
      assumption: {
        en: `No target given, so I halved ${riskiest.ticker} and added bonds (TLT). Try: “rebalance 100 AAPL, 50 MSFT -> 60 AAPL, 90 MSFT”.`,
        es: `No indicaste un objetivo, así que reduje ${riskiest.ticker} a la mitad y agregué bonos (TLT). Prueba: «rebalancear 100 AAPL, 50 MSFT -> 60 AAPL, 90 MSFT».`,
      },
    };
  }
  if (/correl/.test(q)) {
    const ts = mentionedTickers(text);
    return { tool: 'get_correlation_matrix', args: { tickers: ts.length >= 2 ? ts : current.map((p) => p.ticker), ...base } };
  }
  if (/\bvar\b|value at risk|valor en riesgo/.test(q)) {
    const conf = /(9[059](?:\.\d+)?)\s*%/.exec(q);
    return {
      tool: 'calculate_var',
      args: {
        positions: current,
        confidence: conf ? Number(conf[1]) / 100 : 0.95,
        method: /param/.test(q) ? 'parametric' : 'historical',
        portfolio_value: 100000,
        ...base,
      },
    };
  }
  if (/sharpe/.test(q)) return { tool: 'calculate_sharpe_ratio', args: { positions: current, ...base } };
  if (/volatil|riesgo|risk/.test(q)) return { tool: 'calculate_volatility', args: { positions: current, ...base } };
  if (/summary|resumen|portfolio|portafolio|cartera|metrics|m[eé]tricas/.test(q)) {
    return { tool: 'get_portfolio_summary', args: { positions: current, ...base } };
  }
  return null;
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const f2 = (x: number) => x.toFixed(2);

/** Turns a tool result into a short natural-language answer (what the LLM would write in the real app). */
export function explain(tool: string, r: Record<string, any>, lang: Lang): string { // eslint-disable-line @typescript-eslint/no-explicit-any
  const es = lang === 'es';
  switch (tool) {
    case 'list_available_tickers':
      return (es ? 'Tengo datos históricos de: ' : 'Historical data is available for: ') + r.tickers.join(', ') + '.';
    case 'get_portfolio_summary': {
      const w = Object.entries(r.weights as Record<string, number>).map(([t, v]) => `${t} ${pct(v)}`).join(', ');
      return es
        ? `Pesos: ${w}. Retorno anualizado ${pct(r.annualized_return)}, volatilidad ${pct(r.annualized_volatility)}, Sharpe ${f2(r.sharpe_ratio)} (${r.num_observations} observaciones).`
        : `Weights: ${w}. Annualised return ${pct(r.annualized_return)}, volatility ${pct(r.annualized_volatility)}, Sharpe ${f2(r.sharpe_ratio)} (${r.num_observations} observations).`;
    }
    case 'calculate_volatility': {
      const per = Object.entries(r.per_ticker_volatility as Record<string, number>).map(([t, v]) => `${t} ${pct(v)}`).join(', ');
      return es
        ? `Volatilidad anualizada del portafolio: ${pct(r.portfolio_volatility)}. Por activo: ${per}.`
        : `Annualised portfolio volatility: ${pct(r.portfolio_volatility)}. Per asset: ${per}.`;
    }
    case 'calculate_sharpe_ratio':
      return es
        ? `Sharpe anualizado: ${f2(r.sharpe_ratio)} con tasa libre de riesgo ${pct(r.risk_free_rate_used)} (${r.num_observations} observaciones).`
        : `Annualised Sharpe ratio: ${f2(r.sharpe_ratio)} with a ${pct(r.risk_free_rate_used)} risk-free rate (${r.num_observations} observations).`;
    case 'calculate_var':
      return es
        ? `VaR a 1 día (${r.method === 'historical' ? 'histórico' : 'paramétrico'}, ${pct(r.confidence)}): ${r.value_at_risk.toLocaleString('en-US', { maximumFractionDigits: 2 })} sobre un portafolio de ${r.portfolio_value.toLocaleString('en-US')}.`
        : r.interpretation;
    case 'get_correlation_matrix': {
      const pairs = (r.most_correlated_pairs as { ticker_a: string; ticker_b: string; correlation: number }[])
        .map((p) => `${p.ticker_a}/${p.ticker_b} ${f2(p.correlation)}`)
        .join(', ');
      return es ? `Pares más correlacionados: ${pairs}.` : `Most correlated pairs: ${pairs}.`;
    }
    case 'simulate_rebalance': {
      const d = r.delta;
      const sign = (x: number) => (x >= 0 ? '+' : '') + f2(x);
      return es
        ? `Antes → después: retorno ${pct(r.before.annualized_return)} → ${pct(r.after.annualized_return)}, volatilidad ${pct(r.before.annualized_volatility)} → ${pct(r.after.annualized_volatility)}, Sharpe ${f2(r.before.sharpe_ratio)} → ${f2(r.after.sharpe_ratio)} (Δ ${sign(d.sharpe_ratio)}). No se ejecutó ninguna operación.`
        : `Before → after: return ${pct(r.before.annualized_return)} → ${pct(r.after.annualized_return)}, volatility ${pct(r.before.annualized_volatility)} → ${pct(r.after.annualized_volatility)}, Sharpe ${f2(r.before.sharpe_ratio)} → ${f2(r.after.sharpe_ratio)} (Δ ${sign(d.sharpe_ratio)}). No trade was executed.`;
    }
    default:
      return JSON.stringify(r);
  }
}
