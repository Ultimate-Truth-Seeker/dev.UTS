import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Lang } from '../../i18n/context';
import { categoryColor, categoryLabels, coverImage, type Project } from '../../data/projects';
import { asset } from '../../utils/asset';

const W = 1024;
const H = 690;

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string, onLoad: () => void): HTMLImageElement {
  let img = imageCache.get(src);
  if (!img) {
    img = new Image();
    img.decoding = 'async';
    img.src = asset(src);
    imageCache.set(src, img);
  }
  if (!img.complete) img.addEventListener('load', onLoad, { once: true });
  return img;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines);
    cut[maxLines - 1] = cut[maxLines - 1].replace(/\s*\S*$/, '') + '…';
    return cut;
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawScreen(ctx: CanvasRenderingContext2D, project: Project, lang: Lang, onImage: () => void) {
  const accent = categoryColor[project.category];
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#12141f');
  g.addColorStop(1, '#222741');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // window chrome
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, 0, W, 56);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(34 + i * 28, 28, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '22px ui-monospace, Menlo, monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText(`~/projects/${project.id}`, 140, 29);

  // text column
  const x = 56;
  let y = 120;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = accent;
  ctx.font = '600 22px Inter, system-ui, sans-serif';
  ctx.fillText(categoryLabels[project.category][lang].toUpperCase(), x, y);

  y += 62;
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 52px Poppins, Inter, system-ui, sans-serif';
  const title = project.title[lang];
  const titleLines = wrap(ctx, title, 440, 3);
  titleLines.forEach((l) => {
    ctx.fillText(l, x, y);
    y += 60;
  });

  y += 6;
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.font = '400 26px Inter, system-ui, sans-serif';
  wrap(ctx, project.tagline[lang], 440, 4).forEach((l) => {
    ctx.fillText(l, x, y);
    y += 36;
  });

  // tech chips
  let cx = x;
  const cy = H - 150;
  ctx.font = '600 20px Inter, system-ui, sans-serif';
  for (const t of project.tech.slice(0, 4)) {
    const w = ctx.measureText(t).width + 28;
    if (cx + w > 500) break;
    roundRect(ctx, cx, cy, w, 38, 19);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillText(t, cx + 14, cy + 26);
    cx += w + 10;
  }

  // visual
  const vx = 540;
  const vy = 100;
  const vw = 430;
  const vh = 380;
  ctx.save();
  roundRect(ctx, vx, vy, vw, vh, 18);
  ctx.clip();
  ctx.fillStyle = '#0b0d18';
  ctx.fillRect(vx, vy, vw, vh);
  const cover = coverImage(project);
  const img = cover ? loadImage(cover, onImage) : null;
  if (img && img.complete && img.naturalWidth > 0) {
    const s = Math.max(vw / img.naturalWidth, vh / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    ctx.drawImage(img, vx + (vw - dw) / 2, vy + (vh - dh) / 2, dw, dh);
  } else {
    // generative placeholder: never mistaken for a screenshot (it carries a label)
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.moveTo(vx, vy + i * 48);
      ctx.lineTo(vx + vw, vy + vh - i * 48);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.font = '600 24px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(project.demo ? '▶ interactive demo' : '</> source on GitHub', vx + vw / 2, vy + vh / 2 + 8);
    ctx.textAlign = 'left';
  }
  ctx.restore();
  roundRect(ctx, vx, vy, vw, vh, 18);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // footer hint
  ctx.fillStyle = accent;
  ctx.font = '600 24px Inter, system-ui, sans-serif';
  ctx.fillText(lang === 'es' ? '▶ Haz clic en el chip para abrir el caso de estudio' : '▶ Click the chip to open the case study', x, H - 50);
}

/** Draws the selected project on a canvas and exposes it as a three.js texture for the laptop display. */
export function useScreenTexture(project: Project, lang: Lang) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.flipY = true; // verified against the model: the display UVs need the default flip
    // The display mesh only covers u in [0.2693, 0.7128], v in [0.2296, 0.8107] of the original wallpaper
    // texture (read from the GLB), so remap that rectangle onto the whole canvas.
    const [u0, u1, v0, v1] = [0.26933, 0.71281, 0.22955, 0.81072];
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.repeat.set(1 / (u1 - u0), 1 / (v1 - v0));
    t.offset.set(-u0 / (u1 - u0), -v0 / (v1 - v0));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  const [version, setVersion] = useState(0);
  const current = useRef({ project, lang });
  current.current = { project, lang };

  useEffect(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const redraw = () => {
      drawScreen(ctx, current.current.project, current.current.lang, redraw);
      texture.needsUpdate = true;
      setVersion((v) => v + 1);
    };
    redraw();
    // fonts may arrive after the first paint
    void document.fonts?.ready.then(redraw);
  }, [canvas, texture, project, lang]);

  useEffect(() => () => texture.dispose(), [texture]);

  return { texture, version };
}
