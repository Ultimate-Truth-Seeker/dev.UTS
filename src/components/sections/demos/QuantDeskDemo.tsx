import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useLang, type Lang } from '../../../i18n/context';
import { theme } from '../../../styles/theme';
import { tools, ToolError } from './quantMetrics';
import { DEFAULT_PORTFOLIO, explain, route } from './quantRouter';

interface ChatMsg {
  id: number;
  role: 'user' | 'assistant' | 'system';
  text: string;
}
interface TraceEntry {
  id: number;
  dir: 'out' | 'in';
  label: string;
  body: unknown;
}

const Wrap = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 1rem;
  @media (max-width: 860px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Panel = styled.div`
  background: rgba(20, 22, 34, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  min-height: 420px;
  max-height: 560px;
  overflow: hidden;
  h4 {
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.7rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    opacity: 0.75;
  }
`;

const Scroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const Bubble = styled.div<{ speaker: ChatMsg['role'] }>`
  align-self: ${(p) => (p.speaker === 'user' ? 'flex-end' : 'flex-start')};
  max-width: 92%;
  padding: 0.55rem 0.8rem;
  border-radius: 12px;
  font-size: 0.92rem;
  background: ${(p) => (p.speaker === 'user' ? 'rgba(0,255,255,0.16)' : p.speaker === 'system' ? 'transparent' : 'rgba(255,255,255,0.08)')};
  opacity: ${(p) => (p.speaker === 'system' ? 0.65 : 1)};
  font-style: ${(p) => (p.speaker === 'system' ? 'italic' : 'normal')};
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0 1rem 0.6rem;
  button {
    font-size: 0.78rem;
    padding: 0.3rem 0.6rem;
    border-radius: 999px;
    color: ${theme.colors.light};
    border: 1px solid rgba(0, 255, 255, 0.3);
    background: rgba(0, 255, 255, 0.06);
    &:hover {
      background: rgba(0, 255, 255, 0.16);
    }
  }
`;

const Form = styled.form`
  display: flex;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  input {
    flex: 1;
    min-width: 0;
    padding: 0.55rem 0.8rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.25);
    color: inherit;
    font: inherit;
    &:focus {
      outline: 2px solid ${theme.colors.accent};
      outline-offset: 1px;
    }
  }
  button {
    padding: 0 1rem;
    border-radius: 999px;
    background: ${theme.colors.accent};
    color: ${theme.colors.textDark};
    font-weight: 700;
  }
`;

const Pre = styled.pre<{ tone: TraceEntry["dir"] }>`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.72rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  border-left: 3px solid ${(p) => (p.tone === "out" ? "#ffb86b" : "#8affb0")};
  background: rgba(0, 0, 0, 0.3);
  max-height: 200px;
  overflow: auto;
`;

const Note = styled.p`
  font-size: 0.82rem;
  opacity: 0.75;
  margin-bottom: 0.8rem;
  max-width: 80ch;
  strong {
    color: ${theme.colors.light};
  }
`;

const copy = (lang: Lang) =>
  lang === 'es'
    ? {
        note: 'Esto replica en el navegador las 7 herramientas de quant-mcp. En el proyecto real Claude decide qué herramienta llamar; aquí un pequeño enrutador basado en reglas lo sustituye, así que no hace falta ninguna API key. Los precios son sintéticos (movimiento browniano geométrico, semilla 42).',
        chat: 'Conversación',
        trace: 'Tráfico JSON-RPC (MCP)',
        placeholder: 'Pregunta algo, p. ej. “VaR al 99% de 100 AAPL, 40 NVDA”',
        send: 'Enviar',
        hello: `Portafolio por defecto: ${DEFAULT_PORTFOLIO.map((p) => `${p.quantity} ${p.ticker}`).join(', ')}. Puedes escribir tus propias posiciones en el mensaje.`,
        unknown: 'No reconocí esa pregunta. Prueba con volatilidad, Sharpe, VaR, correlación, rebalanceo, resumen o tickers.',
        examples: ['Resumen del portafolio', 'Volatilidad', 'VaR al 99% paramétrico', 'Correlación AAPL MSFT NVDA TLT', 'Rebalancear', '¿Qué tickers hay?'],
        handshake: 'handshake simulado',
        error: 'Error de la herramienta',
        ms: 'ms',
      }
    : {
        note: "This re-implements the 7 quant-mcp tools in the browser. In the real project Claude decides which tool to call; here a tiny rule-based router stands in for it, so no API key is needed. Prices are synthetic (geometric Brownian motion, seed 42).",
        chat: 'Conversation',
        trace: 'JSON-RPC traffic (MCP)',
        placeholder: 'Ask something, e.g. “99% parametric VaR of 100 AAPL, 40 NVDA”',
        send: 'Send',
        hello: `Default portfolio: ${DEFAULT_PORTFOLIO.map((p) => `${p.quantity} ${p.ticker}`).join(', ')}. You can type your own positions in the message.`,
        unknown: "I didn't recognise that. Try volatility, Sharpe, VaR, correlation, rebalance, summary or tickers.",
        examples: ['Portfolio summary', 'Volatility', '99% parametric VaR', 'Correlation AAPL MSFT NVDA TLT', 'Rebalance', 'Which tickers exist?'],
        handshake: 'simulated handshake',
        error: 'Tool error',
        ms: 'ms',
      };

export default function QuantDeskDemo() {
  const { lang } = useLang();
  const c = copy(lang);
  const idRef = useRef(10);
  const rpcRef = useRef(2);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [trace, setTrace] = useState<TraceEntry[]>(() => [
    { id: 1, dir: 'out', label: 'initialize (simulated)', body: { jsonrpc: '2.0', id: 0, method: 'initialize', params: { clientInfo: { name: 'quantdesk-host' } } } },
    { id: 2, dir: 'in', label: 'initialize', body: { jsonrpc: '2.0', id: 0, result: { serverInfo: { name: 'quant-mcp' }, capabilities: { tools: {} } } } },
    { id: 3, dir: 'out', label: 'tools/list', body: { jsonrpc: '2.0', id: 1, method: 'tools/list' } },
    {
      id: 4,
      dir: 'in',
      label: 'tools/list',
      body: { jsonrpc: '2.0', id: 1, result: { tools: tools.map((t) => ({ name: t.name, description: t.description })) } },
    },
  ]);
  const [input, setInput] = useState('');
  const chatEnd = useRef<HTMLDivElement>(null);
  const traceEnd = useRef<HTMLDivElement>(null);

  // Auto-scroll only after the user has asked something (keeps the handshake visible on first load).
  useEffect(() => {
    if (messages.length === 0) return;
    chatEnd.current?.scrollTo?.({ top: chatEnd.current.scrollHeight });
    traceEnd.current?.scrollTo?.({ top: traceEnd.current.scrollHeight });
  }, [messages, trace]);

  const ask = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const userMsg: ChatMsg = { id: idRef.current++, role: 'user', text: clean };
    const plan = route(clean);
    if (!plan) {
      setMessages((m) => [...m, userMsg, { id: idRef.current++, role: 'assistant', text: c.unknown }]);
      return;
    }
    const rpcId = rpcRef.current++;
    const request = { jsonrpc: '2.0', id: rpcId, method: 'tools/call', params: { name: plan.tool, arguments: plan.args } };
    const t0 = performance.now();
    let response: unknown;
    let answer: string;
    try {
      const def = tools.find((t) => t.name === plan.tool)!;
      const result = def.call(plan.args) as Record<string, unknown>;
      response = { jsonrpc: '2.0', id: rpcId, result: { content: [{ type: 'text', text: JSON.stringify(result) }], isError: false } };
      answer = explain(plan.tool, result, lang);
    } catch (err) {
      const message = err instanceof ToolError ? err.message : String(err);
      response = { jsonrpc: '2.0', id: rpcId, result: { content: [{ type: 'text', text: message }], isError: true } };
      answer = `${c.error}: ${message}`;
    }
    const ms = (performance.now() - t0).toFixed(1);
    setTrace((t) => [
      ...t,
      { id: idRef.current++, dir: 'out', label: `tools/call → ${plan.tool}`, body: request },
      { id: idRef.current++, dir: 'in', label: `${plan.tool} · ${ms} ${c.ms}`, body: response },
    ]);
    const assumption = plan.assumption ? ` ${plan.assumption[lang]}` : '';
    setMessages((m) => [...m, userMsg, { id: idRef.current++, role: 'assistant', text: answer + assumption }]);
    setInput('');
  };

  return (
    <div>
      <Note>
        <strong>{lang === 'es' ? 'Sin LLM. ' : 'No LLM. '}</strong>
        {c.note}
      </Note>
      <Wrap>
        <Panel>
          <h4>{c.chat}</h4>
          <Scroll ref={chatEnd} aria-live="polite">
            <Bubble speaker="system">{c.hello}</Bubble>
            {messages.map((m) => (
              <Bubble key={m.id} speaker={m.role}>
                {m.text}
              </Bubble>
            ))}
          </Scroll>
          <Chips>
            {c.examples.map((e) => (
              <button key={e} type="button" onClick={() => ask(e)}>
                {e}
              </button>
            ))}
          </Chips>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={c.placeholder} aria-label={c.placeholder} />
            <button type="submit">{c.send}</button>
          </Form>
        </Panel>
        <Panel>
          <h4>{c.trace}</h4>
          <Scroll ref={traceEnd}>
            {trace.map((t) => (
              <div key={t.id}>
                <small style={{ opacity: 0.7 }}>
                  {t.dir === 'out' ? '→' : '←'} {t.label}
                </small>
                <Pre tone={t.dir}>{JSON.stringify(t.body, null, 1)}</Pre>
              </div>
            ))}
          </Scroll>
        </Panel>
      </Wrap>
    </div>
  );
}
