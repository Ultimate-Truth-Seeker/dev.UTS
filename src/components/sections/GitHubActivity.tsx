import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useLang } from '../../i18n/context';
import { skills } from '../../data/content';
import { siteConfig } from '../../config';
import { theme } from '../../styles/theme';
import { Glass } from '../ui/primitives';

interface Repo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
}

interface Snapshot {
  repos: Repo[];
  fetchedAt: number;
  live: boolean;
}

const CACHE_KEY = 'dev.uts.github.v1';
const TTL = 60 * 60 * 1000;

/** Used only when the GitHub API is unreachable (rate limit, offline). Clearly labelled as a saved snapshot. */
const FALLBACK: Repo[] = [
  ['ProyectoFinalMS', 'Python', '2026-11-02'],
  ['ProyectoFinalDL', 'Python', '2026-11-01'],
  ['lab-pcam-nbody', 'C', '2026-10-10'],
  ['Proyecto1-CPyD', 'C++', '2026-09-08'],
  ['quantdesk', 'Python', '2026-09-08'],
  ['Miniproyecto1-CPyD', 'C', '2026-08-12'],
].map(([name, language, pushed]) => ({
  name,
  html_url: `${siteConfig.github}/${name}`,
  description: null,
  language,
  stargazers_count: 0,
  pushed_at: `${pushed}T00:00:00Z`,
  fork: false,
}));

function readCache(): Snapshot | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Snapshot;
    return Array.isArray(parsed.repos) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(s: Snapshot) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}

const Wrap = styled(Glass)`
  padding: 1.2rem 1.4rem;
  display: grid;
  gap: 1rem;
  h3 {
    font-size: 1.1rem;
    color: ${theme.colors.light};
  }
`;

const Stats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  strong {
    display: block;
    font-size: 1.6rem;
  }
  span {
    font-size: 0.8rem;
    opacity: 0.7;
  }
`;

const LangBar = styled.div`
  display: flex;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
`;

const Legend = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1rem;
  font-size: 0.82rem;
  li::before {
    content: '';
    display: inline-block;
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    margin-right: 0.35rem;
    background: var(--c);
  }
`;

const RepoList = styled.ul`
  list-style: none;
  display: grid;
  gap: 0.4rem;
  li a {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.4rem 0.6rem;
    border-radius: 8px;
    &:hover {
      background: rgba(255, 255, 255, 0.07);
      color: ${theme.colors.light};
    }
  }
  small {
    opacity: 0.6;
    white-space: nowrap;
  }
`;

const palette = ['#00ffff', '#7aa2ff', '#ffb86b', '#ff7ad9', '#8affb0', '#c9a7ff', '#ffd86b'];

export default function GitHubActivity() {
  const { t, lang } = useLang();
  const [snap, setSnap] = useState<Snapshot | null>(() => {
    const c = readCache();
    return c && Date.now() - c.fetchedAt < TTL ? c : null;
  });

  useEffect(() => {
    if (snap) return;
    const ctrl = new AbortController();
    fetch(`https://api.github.com/users/${siteConfig.githubUser}/repos?per_page=100&sort=pushed`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<Repo[]>;
      })
      .then((repos) => {
        const s: Snapshot = { repos: repos.filter((r) => !r.fork), fetchedAt: Date.now(), live: true };
        writeCache(s);
        setSnap(s);
      })
      .catch((err: unknown) => {
        if ((err as Error).name === 'AbortError') return;
        const stale = readCache();
        setSnap(stale ? { ...stale, live: false } : { repos: FALLBACK, fetchedAt: 0, live: false });
      });
    return () => ctrl.abort();
  }, [snap]);

  if (!snap) return <Wrap>{t(skills.githubLoading)}</Wrap>;

  const repos = snap.repos;
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const langCounts = new Map<string, number>();
  repos.forEach((r) => r.language && langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1));
  const langs = [...langCounts].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const langTotal = langs.reduce((a, [, n]) => a + n, 0) || 1;
  const recent = [...repos].sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at)).slice(0, 5);
  const fmt = new Intl.DateTimeFormat(lang === 'es' ? 'es-GT' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <Wrap>
      <h3>{t(skills.githubTitle)}</h3>
      {!snap.live && <small style={{ opacity: 0.7 }}>{t(skills.githubFallback)}</small>}
      <Stats>
        {snap.live || snap.fetchedAt ? (
          <div>
            <strong>{repos.length}</strong>
            <span>{t(skills.githubRepos)}</span>
          </div>
        ) : null}
        {snap.live && (
          <div>
            <strong>{stars}</strong>
            <span>{t(skills.githubStars)}</span>
          </div>
        )}
      </Stats>
      {langs.length > 0 && (
        <div>
          <small style={{ opacity: 0.7 }}>{t(skills.githubLanguages)}</small>
          <LangBar aria-hidden="true">
            {langs.map(([name, n], i) => (
              <div key={name} style={{ width: `${(n / langTotal) * 100}%`, background: palette[i % palette.length] }} />
            ))}
          </LangBar>
          <Legend>
            {langs.map(([name, n], i) => (
              <li key={name} style={{ ['--c' as string]: palette[i % palette.length] }}>
                {name} ({n})
              </li>
            ))}
          </Legend>
        </div>
      )}
      <div>
        <small style={{ opacity: 0.7 }}>{t(skills.githubLatest)}</small>
        <RepoList>
          {recent.map((r) => (
            <li key={r.name}>
              <a href={r.html_url} target="_blank" rel="noopener noreferrer">
                <span>{r.name}</span>
                <small>
                  {r.language ? `${r.language} · ` : ''}
                  {fmt.format(new Date(r.pushed_at))}
                </small>
              </a>
            </li>
          ))}
        </RepoList>
      </div>
    </Wrap>
  );
}
