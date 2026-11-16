import { computeGhostEdgeDim } from './math';

export type FallKind = 'ghost' | 'lava';
export type DustKind = 'wisp' | 'mote' | 'spray' | 'bubble' | 'shimmer';

interface Streak {
  x: number;
  sw: number;
  len: number;
  v: number;
  phase: number;
  opacity: number;
  spriteIdx: 0 | 1;
}

export interface FallCanvasState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  kind: FallKind;
  speed: number;
  isSeam: boolean;
  w: number;
  h: number;
  dpr: number;
  streaks: Streak[];
}

interface Particle {
  u: number;
  v: number;
  r: number;
  phase: number;
  speed: number;
}

export interface DustCanvasState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  kind: DustKind;
  box: { x: number; y: number; w: number; h: number };
  w: number;
  h: number;
  dpr: number;
  particles: Particle[];
}

export interface StreakSpriteBank {
  ghost: [HTMLCanvasElement, HTMLCanvasElement];
  lava: [HTMLCanvasElement, HTMLCanvasElement];
}

function makeStreakSprite(
  stops: Array<[number, string]>,
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 160;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 160);
    for (const [offset, color] of stops) {
      g.addColorStop(offset, color);
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 8, 160);
  }
  return c;
}

export function createStreakSprites(): StreakSpriteBank {
  return {
    ghost: [
      makeStreakSprite([
        [0, 'rgba(190,240,255,0)'],
        [0.35, 'rgba(210,248,255,.95)'],
        [1, 'rgba(120,200,255,0)'],
      ]),
      makeStreakSprite([
        [0, 'rgba(120,190,255,0)'],
        [0.5, 'rgba(140,215,255,.8)'],
        [1, 'rgba(90,150,255,0)'],
      ]),
    ],
    lava: [
      makeStreakSprite([
        [0, 'rgba(255,190,80,0)'],
        [0.4, 'rgba(255,236,150,1)'],
        [1, 'rgba(255,120,30,0)'],
      ]),
      makeStreakSprite([
        [0, 'rgba(255,120,30,0)'],
        [0.5, 'rgba(255,150,50,.9)'],
        [1, 'rgba(255,80,20,0)'],
      ]),
    ],
  };
}

function buildStreaks(
  kind: FallKind,
  w: number,
  h: number,
): Streak[] {
  const streaks: Streak[] = [];
  if (w <= 0 || h <= 0) return streaks;

  const count =
    kind === 'ghost'
      ? Math.round(w / 2.2) * 2
      : Math.round(w / 3) * 3;

  for (let i = 0; i < count; i++) {
    const x =
      kind === 'ghost'
        ? Math.random() * w
        : w * 0.25 + Math.random() * w * 0.5;
    const sw =
      kind === 'ghost'
        ? 0.8 + Math.random() * 3.2
        : 1 + Math.random() * 2.2;
    const len =
      kind === 'ghost'
        ? 60 + Math.random() * 220
        : 30 + Math.random() * 70;
    const v =
      kind === 'ghost'
        ? 420 + Math.random() * 340
        : 195 + Math.random() * 155;
    const phase = Math.random() * (h + len);
    const opacity = 0.18 + Math.random() * 0.55;
    const spriteIdx: 0 | 1 = Math.random() < 0.45 ? 0 : 1;
    streaks.push({ x, sw, len, v, phase, opacity, spriteIdx });
  }
  return streaks;
}

export function sizeFallCanvas(state: FallCanvasState): void {
  const w = state.canvas.offsetWidth;
  const h = state.canvas.offsetHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  state.w = w;
  state.h = h;
  state.dpr = dpr;
  state.canvas.width = Math.max(1, Math.round(w * dpr));
  state.canvas.height = Math.max(1, Math.round(h * dpr));
  state.streaks = buildStreaks(state.kind, w, h);
}

export function initFallCanvas(canvas: HTMLCanvasElement): FallCanvasState | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const kind: FallKind = canvas.dataset.kind === 'lava' ? 'lava' : 'ghost';
  const speed = parseFloat(canvas.dataset.speed || '1') || 1;
  const isSeam = canvas.dataset.seam === '1';
  const state: FallCanvasState = {
    canvas,
    ctx,
    kind,
    speed,
    isSeam,
    w: 0,
    h: 0,
    dpr: 1,
    streaks: [],
  };
  sizeFallCanvas(state);
  return state;
}

export function renderFallCanvas(
  state: FallCanvasState,
  sprites: StreakSpriteBank,
  t: number,
  forceDraw = false,
): void {
  const { canvas, ctx, kind, speed, isSeam, w, h, dpr, streaks } = state;
  if (w <= 0 || h <= 0) return;

  if (!forceDraw) {
    const rect = canvas.getBoundingClientRect();
    if (rect.bottom < -50 || rect.top > window.innerHeight + 50) {
      return;
    }
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  if (isSeam) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const wg = ctx.createLinearGradient(0, 0, w, 0);
    wg.addColorStop(0, 'rgba(80,150,255,0)');
    wg.addColorStop(0.18, 'rgba(90,175,255,.7)');
    wg.addColorStop(0.5, 'rgba(175,238,255,.96)');
    wg.addColorStop(0.82, 'rgba(90,175,255,.7)');
    wg.addColorStop(1, 'rgba(80,150,255,0)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.globalCompositeOperation = 'lighter';
  const pair = sprites[kind];

  for (let i = 0; i < streaks.length; i++) {
    const s = streaks[i];
    const span = h + s.len;
    const y = ((t * s.v * speed + s.phase) % span) - s.len;
    const dim = kind === 'ghost' ? computeGhostEdgeDim(s.x, w) : 1;
    ctx.globalAlpha = s.opacity * dim;
    const img = pair[s.spriteIdx];
    ctx.drawImage(img, s.x - s.sw * 0.5, y, s.sw, s.len);
    ctx.drawImage(img, s.x - s.sw * 0.5, y - span, s.sw, s.len);
  }
}

export function sizeDustCanvas(state: DustCanvasState): void {
  const w = state.canvas.offsetWidth;
  const h = state.canvas.offsetHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  state.w = w;
  state.h = h;
  state.dpr = dpr;
  state.canvas.width = Math.max(1, Math.round(w * dpr));
  state.canvas.height = Math.max(1, Math.round(h * dpr));
}

export function initDustCanvas(canvas: HTMLCanvasElement): DustCanvasState | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const kind = (canvas.dataset.dust || 'wisp') as DustKind;
  const count = parseInt(canvas.dataset.count || '50', 10) || 50;
  const bx = parseFloat(canvas.dataset.x ?? '0');
  const by = parseFloat(canvas.dataset.y ?? '0');
  const bw = parseFloat(canvas.dataset.w ?? '100');
  const bh = parseFloat(canvas.dataset.h ?? '100');

  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      u: kind === 'wisp' ? 0.2 + Math.random() * 0.6 : Math.random(),
      v: kind === 'wisp' ? 0.35 + Math.random() * 0.63 : Math.random(),
      r: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
    });
  }

  const state: DustCanvasState = {
    canvas,
    ctx,
    kind,
    box: { x: bx, y: by, w: bw, h: bh },
    w: 0,
    h: 0,
    dpr: 1,
    particles,
  };
  sizeDustCanvas(state);
  return state;
}

export function renderDustCanvas(
  state: DustCanvasState,
  t: number,
  forceDraw = false,
): void {
  const { canvas, ctx, kind, box, w, h, dpr, particles } = state;
  if (w <= 0 || h <= 0) return;

  if (!forceDraw) {
    const rect = canvas.getBoundingClientRect();
    if (rect.bottom < -50 || rect.top > window.innerHeight + 50) {
      return;
    }
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const bx = (box.x / 100) * w;
  const by = (box.y / 100) * h;
  const bw = (box.w / 100) * w;
  const bh = (box.h / 100) * h;
  const scale = w / 1440;

  if (kind === 'wisp') {
    const riseSpan = 0.98 - 0.35;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const initProg = 0.98 - p.v;
      const totalProg = initProg + t * 0.02 * p.speed;
      const cycle = Math.floor(totalProg / riseSpan);
      const prog = totalProg % riseSpan;
      const v = 0.98 - prog;
      // Respawn x across 0.2..0.8 on each cycle deterministically
      const cycleShift = ((cycle * 0.381966) % 1);
      const u = 0.2 + ((p.u - 0.2 + cycleShift * 0.6) % 0.6);
      const x = (u + Math.sin(t * 1.4 + p.phase) * 0.012) * w;
      const y = v * h;
      const rad = (0.8 + p.r * 1.8) * Math.max(0.75, scale);
      const fadeIn = Math.min(1, prog / 0.25);
      const pulse = Math.abs(Math.sin(2 * t + p.phase));
      const a = fadeIn * pulse * 0.85;
      ctx.fillStyle = `rgba(190,240,255,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (kind === 'mote') {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const v = (1 + p.v - ((t * 0.008 * p.speed) % 1)) % 1;
      const u = p.u + Math.sin(t * 0.9 + p.phase) * 0.02;
      const x = u * w;
      const y = v * h;
      const rad = (0.6 + p.r * 1.4) * Math.max(0.75, scale);
      const a = 0.25 + p.r * 0.5;
      ctx.fillStyle = `rgba(170,225,255,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (kind === 'spray') {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const life = (t * p.speed * 0.8 + p.phase) % 1;
      const px = bx + (p.u + (p.r - 0.5) * 0.6 * life) * bw;
      const py = by + (p.v * 0.25 + life * life * 0.9) * bh;
      const rad = (0.7 + p.r * 1.6) * Math.max(0.75, scale);
      const a = (1 - life) * 0.85;
      ctx.fillStyle = `rgba(200,245,255,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (kind === 'bubble') {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const life = (t * p.speed * 0.16 + p.phase) % 1;
      const wob = Math.sin(1.4 * t + p.phase) * 0.03 * bw;
      const px = bx + p.u * bw + wob;
      const py = by + (1 - life) * bh;
      const rad = (2 + p.r * 7) * scale;
      const a = Math.sin(life * Math.PI) * 0.9;
      if (a <= 0.01 || rad <= 0.2) continue;

      const g = ctx.createRadialGradient(
        px - rad * 0.3,
        py - rad * 0.3,
        rad * 0.1,
        px,
        py,
        rad,
      );
      g.addColorStop(0, `rgba(255,240,180,${a.toFixed(3)})`);
      g.addColorStop(0.55, `rgba(255,170,70,${(0.55 * a).toFixed(3)})`);
      g.addColorStop(1, 'rgba(255,120,30,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (kind === 'shimmer') {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const a = Math.max(0, Math.sin(t * (1.2 + 2 * p.r) + p.phase)) * 0.8;
      if (a <= 0.01) continue;
      const spread = 0.3 + 0.7 * p.v;
      const px = bx + bw * 0.5 + (p.u - 0.5) * bw * spread;
      const py = by + p.v * bh;
      const len = (12 + p.r * 20) * Math.max(0.65, scale);
      ctx.fillStyle = `rgba(255,240,205,${a.toFixed(3)})`;
      ctx.fillRect(px - len * 0.5, py, len, 1.2);
    }
  }
}
