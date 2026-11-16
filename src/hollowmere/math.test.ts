import test from 'node:test';
import assert from 'node:assert/strict';
import { SPRITE_CROPS } from './assets';
import { SCENES, SEAMS } from './data';
import {
  computeBatState,
  computeGhostEdgeDim,
  computeGhostState,
  computeHeroParallax,
  computeMobileArtLeftPx,
  computeSmoothScrollStep,
  computeSpriteStyle,
} from './math';

test('sprite crop math matches 1024x688 sprite sheet formula', () => {
  const g1 = computeSpriteStyle(SPRITE_CROPS.ghost1);
  assert.equal(g1.aspectRatio, '204 / 221');
  assert.ok(Math.abs(parseFloat(g1.backgroundSize) - (1024 / 204) * 100) < 0.01);
  assert.ok(Math.abs(parseFloat(g1.backgroundPosition) - (39 / (1024 - 204)) * 100) < 0.01);

  const batUp = computeSpriteStyle(SPRITE_CROPS.batUp);
  assert.equal(batUp.aspectRatio, '203 / 221');
});

test('smooth scroll step eases towards target and snaps within 0.05px', () => {
  const stepped = computeSmoothScrollStep(0, 1000, 1 / 60);
  assert.ok(stepped > 100 && stepped < 140);

  const snapped = computeSmoothScrollStep(99.97, 100, 1 / 60);
  assert.equal(snapped, 100);
});

test('hero parallax lags art at 0.32x, copy at 0.55x, and spreads letter-spacing to +0.18em', () => {
  const start = computeHeroParallax(0, 810);
  assert.equal(start.artY, 0);
  assert.equal(start.copyY, 0);
  assert.equal(start.letterSpacingExtraEm, 0);

  const mid = computeHeroParallax(405, 810);
  assert.ok(Math.abs(mid.artY - 129.6) < 0.01);
  assert.ok(Math.abs(mid.copyY - 222.75) < 0.01);
  assert.ok(Math.abs(mid.letterSpacingExtraEm - 0.09) < 0.001);

  const past = computeHeroParallax(1500, 810);
  assert.equal(past.letterSpacingExtraEm, 0.18);
});

test('ghost cursor repulsion pushes away within 260px and relaxes outside', () => {
  const near = computeGhostState({
    t: 0,
    dt: 1 / 60,
    phase: 0,
    anchorXPct: 50,
    anchorYPct: 50,
    artWidth: 1440,
    artHeight: 810,
    artLeft: 0,
    artTop: 0,
    cursorX: 720,
    cursorY: 455, // 50px below ghost (720, 405)
    offsetX: 0,
    offsetY: 0,
  });
  assert.ok(near.offsetY < 0, 'ghost should be pushed upward away from cursor below it');
  assert.ok(Math.abs(near.offsetX) < 0.01);

  const far = computeGhostState({
    t: 0,
    dt: 1 / 60,
    phase: 0,
    anchorXPct: 50,
    anchorYPct: 50,
    artWidth: 1440,
    artHeight: 810,
    artLeft: 0,
    artTop: 0,
    cursorX: 100,
    cursorY: 100,
    offsetX: -20,
    offsetY: -20,
  });
  assert.ok(far.offsetX > -20 && far.offsetY > -20, 'ghost should relax back toward anchor');
});

test('bat flight loops -8% to 108% and swaps wingsDown state', () => {
  const b0 = computeBatState({
    t: 0,
    durationSec: 10,
    offset: 0,
    y0Pct: 20,
    ampPct: 2,
    flapHz: 10,
  });
  assert.equal(b0.xPct, -8);
  assert.equal(b0.wingsDown, false);

  const bHalf = computeBatState({
    t: 5,
    durationSec: 10,
    offset: 0,
    y0Pct: 20,
    ampPct: 2,
    flapHz: 10,
  });
  assert.ok(Math.abs(bHalf.xPct - 50) < 0.01);

  const bFlap = computeBatState({
    t: 0.12,
    durationSec: 10,
    offset: 0,
    y0Pct: 20,
    ampPct: 2,
    flapHz: 10,
  });
  assert.equal(bFlap.wingsDown, true);
});

test('ghost edge dimming and mobile focus alignment formulas', () => {
  assert.equal(computeGhostEdgeDim(50, 100), 1);
  assert.ok(Math.abs(computeGhostEdgeDim(0, 100) - 0.4) < 0.001);

  // At 390px viewport, artH = 92svh = 776.48, focus = 50 centers art
  const artH = 776.48;
  const artW = (artH * 2688) / 1520;
  const left = computeMobileArtLeftPx(390, artH, 50);
  assert.ok(Math.abs(left - (195 - artW * 0.5)) < 0.01);
});

test('all 5 scenes and 4 seams match Hollowmere structure', () => {
  assert.equal(SCENES.length, 5);
  assert.equal(SEAMS.length, 4);
  assert.equal(SCENES[0].glows.length, 12);
  assert.equal(SCENES[0].ghosts.length, 4);
  assert.equal(SCENES[0].bats.length, 4);
  assert.equal(SCENES[3].falls.filter((f) => f.kind === 'lava').length, 3);
  assert.equal(SCENES[4].glows.length, 15);
  assert.equal(SCENES[4].bats.length, 3);
  assert.equal(SEAMS[3].fall, undefined);
});
