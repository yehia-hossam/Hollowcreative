import {
  SPRITE_SHEET_HEIGHT,
  SPRITE_SHEET_WIDTH,
  type SpriteCrop,
} from './assets';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface SpriteCss {
  backgroundSize: string;
  backgroundPosition: string;
  aspectRatio: string;
}

export function computeSpriteStyle(
  crop: SpriteCrop,
  sheetW = SPRITE_SHEET_WIDTH,
  sheetH = SPRITE_SHEET_HEIGHT,
): SpriteCss {
  const [x, y, w, h] = crop;
  const sizeX = (sheetW / w) * 100;
  const sizeY = (sheetH / h) * 100;
  const posX = (x / (sheetW - w)) * 100;
  const posY = (y / (sheetH - h)) * 100;
  return {
    backgroundSize: `${sizeX.toFixed(4)}% ${sizeY.toFixed(4)}%`,
    backgroundPosition: `${posX.toFixed(4)}% ${posY.toFixed(4)}%`,
    aspectRatio: `${w} / ${h}`,
  };
}

export function computeSmoothScrollStep(
  current: number,
  target: number,
  dtSeconds: number,
): number {
  const diff = target - current;
  if (Math.abs(diff) <= 0.05) return target;
  const factor = 1 - Math.exp(-7.5 * Math.max(0, dtSeconds));
  const next = current + diff * factor;
  if (Math.abs(target - next) <= 0.05) return target;
  return next;
}

export interface HeroParallax {
  artY: number;
  copyY: number;
  letterSpacingExtraEm: number;
}

export function computeHeroParallax(cur: number, heroHeight: number): HeroParallax {
  const safeH = Math.max(1, heroHeight);
  const hp = clamp(cur / safeH, 0, 1);
  return {
    artY: cur * 0.32,
    copyY: cur * 0.55,
    letterSpacingExtraEm: hp * 0.18,
  };
}

export interface GhostInput {
  t: number;
  dt: number;
  phase: number;
  anchorXPct: number;
  anchorYPct: number;
  artWidth: number;
  artHeight: number;
  artLeft: number;
  artTop: number;
  cursorX: number | null;
  cursorY: number | null;
  offsetX: number;
  offsetY: number;
}

export interface GhostOutput {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  rotateDeg: number;
}

export function computeGhostState(input: GhostInput): GhostOutput {
  const {
    t,
    dt,
    phase,
    anchorXPct,
    anchorYPct,
    artWidth,
    artHeight,
    artLeft,
    artTop,
    cursorX,
    cursorY,
    offsetX,
    offsetY,
  } = input;

  const baseX = (artWidth * anchorXPct) / 100;
  const baseY = (artHeight * anchorYPct) / 100;
  const wanderX = Math.sin(0.35 * t + phase) * artWidth * 0.012;
  const wanderY = Math.sin(0.9 * t + phase) * artHeight * 0.014;

  let targetOx = 0;
  let targetOy = 0;
  if (cursorX !== null && cursorY !== null) {
    const gx = artLeft + baseX + wanderX;
    const gy = artTop + baseY + wanderY;
    const dx = gx - cursorX;
    const dy = gy - cursorY;
    const d = Math.hypot(dx, dy);
    if (d < 260 && d > 0.001) {
      const push = Math.pow(1 - d / 260, 1.5) * 90;
      targetOx = (dx / d) * push;
      targetOy = (dy / d) * push;
    }
  }

  const ease = 1 - Math.exp(-3 * Math.max(0, dt));
  const nextOx = offsetX + (targetOx - offsetX) * ease;
  const nextOy = offsetY + (targetOy - offsetY) * ease;
  const rotateDeg = Math.sin(0.7 * t + phase) * 6 + nextOx * 0.05;

  return {
    x: baseX + wanderX + nextOx,
    y: baseY + wanderY + nextOy,
    offsetX: nextOx,
    offsetY: nextOy,
    rotateDeg,
  };
}

export interface BatInput {
  t: number;
  durationSec: number;
  offset: number;
  y0Pct: number;
  ampPct: number;
  flapHz: number;
}

export interface BatOutput {
  xPct: number;
  yPct: number;
  wingsDown: boolean;
}

export function computeBatState(input: BatInput): BatOutput {
  const { t, durationSec, offset, y0Pct, ampPct, flapHz } = input;
  const safeDur = Math.max(0.1, durationSec);
  const rawP = (t / safeDur + offset) % 1;
  const p = rawP < 0 ? rawP + 1 : rawP;
  const xPct = -8 + p * 116; // -8% -> 108%
  const yPct = y0Pct + Math.sin(p * 9 + offset * 6) * ampPct;
  const wingsDown = Math.floor(t * flapHz + offset * 10) % 2 === 1;
  return { xPct, yPct, wingsDown };
}

export function computeGhostEdgeDim(x: number, width: number): number {
  if (width <= 0) return 1;
  const norm = Math.abs(x / width - 0.5) * 2;
  return Math.max(0, 1 - norm * norm * 0.6);
}

export function computeMobileArtLeftPx(
  viewportWidth: number,
  artHeight: number,
  focusPct: number,
): number {
  const artWidth = (artHeight * 2688) / 1520;
  return viewportWidth * 0.5 - (focusPct / 100) * artWidth;
}

export function computeLanternStep(
  curX: number,
  curY: number,
  targetX: number,
  targetY: number,
  dtSeconds: number,
): { x: number; y: number } {
  const ease = 1 - Math.exp(-10 * Math.max(0, dtSeconds));
  return {
    x: curX + (targetX - curX) * ease,
    y: curY + (targetY - curY) * ease,
  };
}
