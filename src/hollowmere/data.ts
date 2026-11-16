import { SCENE_IMAGES, SEAM_IMAGES, type SpriteCrop, SPRITE_CROPS } from './assets';

export interface GlowSpec {
  x: number;
  y: number;
  w: number;
  h?: number;
  cold?: boolean;
}

export interface FallSpec {
  kind: 'ghost' | 'lava';
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
}

export interface DustSpec {
  kind: 'wisp' | 'mote' | 'spray' | 'bubble' | 'shimmer';
  count: number;
  box?: { x: number; y: number; w: number; h: number };
}

export interface GhostSpec {
  id: string;
  crop: SpriteCrop;
  x: number;
  y: number;
  w: number;
  phase: number;
}

export interface BatSpec {
  id: string;
  y0: number;
  w: number;
  durationSec: number;
  offset: number;
  ampPct: number;
  flapHz: number;
}

export interface SceneCopyBlock {
  h2: string;
  items: Array<
    | { type: 'h3'; text: string }
    | { type: 'p'; text: string }
  >;
  buttons?: Array<{ label: string; href: string; ghost?: boolean }>;
  align: 'left' | 'right' | 'center';
  leftPct?: number;
  topPct: number;
  widthPct: number;
}

export interface SceneSpec {
  id: 'top' | 'story' | 'rites' | 'night' | 'finale';
  focus: number;
  image: string;
  moonglow?: { x: number; y: number; w: number };
  mist?: { x: number; y: number; w: number; h: number };
  falls: FallSpec[];
  glows: GlowSpec[];
  dust: DustSpec;
  ghosts: GhostSpec[];
  bats: BatSpec[];
  copy?: SceneCopyBlock;
}

export interface SeamSpec {
  id: string;
  focus: number;
  image: string;
  fall?: { x: number; y: number; w: number; h: number; speed: number };
}

export const SCENES: SceneSpec[] = [
  {
    id: 'top',
    focus: 50,
    image: SCENE_IMAGES.hero,
    moonglow: { x: 50.2, y: 25.6, w: 21 },
    mist: { x: 50, y: 73, w: 22, h: 9 },
    falls: [
      { kind: 'ghost', x: 47.4, y: 51, w: 5.6, h: 22, speed: 1 },
      { kind: 'ghost', x: 44, y: 80, w: 12.4, h: 34, speed: 1.15 },
    ],
    glows: [
      { x: 4.8, y: 54.4, w: 4.6 },
      { x: 18.5, y: 50.6, w: 3.6 },
      { x: 17.5, y: 69.4, w: 3.8 },
      { x: 25.9, y: 38.3, w: 2.6 },
      { x: 31.6, y: 42, w: 2.4 },
      { x: 30.4, y: 63, w: 2.4 },
      { x: 80, y: 36.7, w: 3 },
      { x: 85, y: 45.3, w: 3 },
      { x: 93.8, y: 53, w: 4.6 },
      { x: 87.8, y: 73, w: 3.8 },
      { x: 74.5, y: 61, w: 2.6 },
      { x: 67.2, y: 64.8, w: 2.6 },
    ],
    dust: { kind: 'wisp', count: 70 },
    ghosts: [
      { id: 'hero-g1', crop: SPRITE_CROPS.ghost1, x: 21, y: 30, w: 4.2, phase: 0.4 },
      { id: 'hero-g2', crop: SPRITE_CROPS.ghost2, x: 78, y: 21, w: 3.4, phase: 2.1 },
      { id: 'hero-g4', crop: SPRITE_CROPS.ghost4, x: 64, y: 44, w: 2.8, phase: 3.8 },
      { id: 'hero-g3', crop: SPRITE_CROPS.ghost3, x: 36, y: 46, w: 2.4, phase: 5.2 },
    ],
    bats: [
      { id: 'hero-b1', y0: 12, w: 2.4, durationSec: 11.5, offset: 0.12, ampPct: 2.2, flapHz: 9.5 },
      { id: 'hero-b2', y0: 20, w: 1.8, durationSec: 14.2, offset: 0.47, ampPct: 3.1, flapHz: 11 },
      { id: 'hero-b3', y0: 28, w: 2.9, durationSec: 9.8, offset: 0.78, ampPct: 1.8, flapHz: 8.5 },
      { id: 'hero-b4', y0: 16, w: 2.1, durationSec: 15.4, offset: 0.91, ampPct: 2.6, flapHz: 10.2 },
    ],
  },
  {
    id: 'story',
    focus: 48,
    image: SCENE_IMAGES.story,
    mist: { x: 49, y: 84, w: 34, h: 14 },
    falls: [{ kind: 'ghost', x: 40.6, y: 0, w: 17.2, h: 90, speed: 0.9 }],
    glows: [
      { x: 20.3, y: 69.8, w: 7, cold: true },
      { x: 72.5, y: 19, w: 5, cold: true },
      { x: 80.4, y: 18.1, w: 4.4, cold: true },
      { x: 76, y: 41.6, w: 5.6, cold: true },
      { x: 85, y: 43.3, w: 4, cold: true },
      { x: 70.5, y: 68.5, w: 4.4, cold: true },
      { x: 77.3, y: 63.7, w: 4.4, cold: true },
      { x: 85.3, y: 66.3, w: 4, cold: true },
      { x: 7.6, y: 85, w: 4.4 },
      { x: 13.2, y: 87, w: 3.2 },
      { x: 92.2, y: 84, w: 3.6 },
    ],
    dust: { kind: 'mote', count: 50 },
    ghosts: [
      { id: 'story-g4', crop: SPRITE_CROPS.ghost4, x: 30, y: 22, w: 2.6, phase: 1.7 },
    ],
    bats: [],
    copy: {
      h2: 'Our Story',
      align: 'left',
      leftPct: 6.5,
      topPct: 26,
      widthPct: 31,
      items: [
        {
          type: 'p',
          text: 'Every October the falls of Hollowmere run pale. For one night the canyon lights its lanterns, the old houses open their doors, and the ghosts come home to visit.',
        },
        {
          type: 'p',
          text: 'We have kept the night for two hundred years: a walk through the crypts, the mill and the cauldron halls, ending at the lake where the lanterns are set free.',
        },
      ],
      buttons: [{ label: 'Read the legend', href: '#rites' }],
    },
  },
  {
    id: 'rites',
    focus: 40,
    image: SCENE_IMAGES.rites,
    mist: { x: 31, y: 33, w: 22, h: 10 },
    falls: [{ kind: 'ghost', x: 19.5, y: 0, w: 18, h: 38, speed: 1.05 }],
    glows: [
      { x: 12, y: 34, w: 4.2 },
      { x: 37.5, y: 47.7, w: 4.2 },
      { x: 32.3, y: 52.6, w: 4.2 },
      { x: 11.7, y: 62.3, w: 4.2 },
      { x: 39, y: 78.2, w: 4.2 },
      { x: 64.5, y: 70.3, w: 9, cold: true },
      { x: 88.5, y: 70.7, w: 9, cold: true },
      { x: 61.4, y: 75, w: 2.4 },
      { x: 72.6, y: 75.4, w: 2.4 },
      { x: 91.5, y: 75.4, w: 2.4 },
    ],
    dust: { kind: 'spray', count: 60, box: { x: 20, y: 30, w: 20, h: 18 } },
    ghosts: [],
    bats: [],
    copy: {
      h2: 'The Rites',
      align: 'right',
      leftPct: 55,
      topPct: 24,
      widthPct: 40,
      items: [
        { type: 'h3', text: 'The Lantern Walk.' },
        {
          type: 'p',
          text: 'At dusk the procession leaves the castle gate and follows the ghost-light falls down into the canyon. Bring a lantern, or borrow one of ours at the gate.',
        },
        {
          type: 'p',
          text: 'Children lead, the old walk last, and nobody looks back until the bells stop.',
        },
        { type: 'h3', text: 'The Turning Wheel.' },
        {
          type: 'p',
          text: 'Below the falls the old mill turns all night. Write a wish on a paper lantern, pin it to a spoke, and let the wheel carry it round to midnight.',
        },
      ],
    },
  },
  {
    id: 'night',
    focus: 66,
    image: SCENE_IMAGES.night,
    falls: [
      { kind: 'ghost', x: 67.4, y: 0, w: 11.8, h: 37, speed: 1 },
      { kind: 'lava', x: 62.3, y: 66.5, w: 1.8, h: 25, speed: 0.55 },
      { kind: 'lava', x: 69.4, y: 66.5, w: 1.8, h: 25, speed: 0.6 },
      { kind: 'lava', x: 76.5, y: 66.5, w: 1.8, h: 25, speed: 0.5 },
    ],
    glows: [
      { x: 70, y: 93, w: 26 },
      { x: 16.8, y: 78.2, w: 6 },
      { x: 27.8, y: 85.3, w: 4 },
      { x: 18, y: 66.3, w: 8 },
      { x: 73, y: 33, w: 14, cold: true },
    ],
    dust: { kind: 'bubble', count: 22, box: { x: 60, y: 8, w: 24, h: 28 } },
    ghosts: [],
    bats: [],
    copy: {
      h2: 'Plan Your Night',
      align: 'left',
      leftPct: 6.5,
      topPct: 25,
      widthPct: 40,
      items: [
        { type: 'h3', text: 'Gates at Six.' },
        {
          type: 'p',
          text: 'The gates open at 18:00 on 31 October. The walk takes about ninety minutes, and the cauldron halls stay open until three, serving spiced cider, soul cakes and hot pumpkin broth.',
        },
        { type: 'h3', text: 'Midnight at the Cauldron.' },
        {
          type: 'p',
          text: 'At the twelfth bell the great cauldron is lit and every lantern in Hollowmere is carried down to the lake. Stay for it.',
        },
      ],
    },
  },
  {
    id: 'finale',
    focus: 45,
    image: SCENE_IMAGES.finale,
    moonglow: { x: 39.1, y: 56.6, w: 19 },
    falls: [],
    glows: [
      { x: 29.9, y: 76.7, w: 3.4 },
      { x: 32.9, y: 72.7, w: 2.4 },
      { x: 45.9, y: 72.7, w: 2.4 },
      { x: 48.3, y: 77.4, w: 3.6 },
      { x: 55.4, y: 81.8, w: 4 },
      { x: 58.1, y: 75.6, w: 3.2 },
      { x: 53.9, y: 72.2, w: 2.2 },
      { x: 62.5, y: 72.5, w: 2.2 },
      { x: 69.9, y: 80.9, w: 4 },
      { x: 74.9, y: 75.9, w: 3.2 },
      { x: 73, y: 72.3, w: 2.2 },
      { x: 79.1, y: 72.5, w: 2.2 },
      { x: 24.8, y: 72.1, w: 2.2 },
      { x: 7.8, y: 65.4, w: 5 },
      { x: 89.8, y: 76.9, w: 5 },
    ],
    dust: { kind: 'shimmer', count: 90, box: { x: 34, y: 69, w: 10, h: 22 } },
    ghosts: [
      { id: 'finale-g2', crop: SPRITE_CROPS.ghost2, x: 66, y: 26, w: 3, phase: 0.9 },
      { id: 'finale-g1', crop: SPRITE_CROPS.ghost1, x: 27, y: 38, w: 2.6, phase: 3.1 },
    ],
    bats: [
      { id: 'finale-b1', y0: 27, w: 2.1, durationSec: 12.6, offset: 0.22, ampPct: 2.4, flapHz: 9.2 },
      { id: 'finale-b2', y0: 34, w: 1.7, durationSec: 10.4, offset: 0.61, ampPct: 1.7, flapHz: 11.4 },
      { id: 'finale-b3', y0: 38, w: 2.6, durationSec: 14.8, offset: 0.85, ampPct: 2.9, flapHz: 8.6 },
    ],
    copy: {
      h2: 'See you at midnight.',
      align: 'center',
      topPct: 30,
      widthPct: 60,
      items: [],
      buttons: [
        { label: 'Get tickets', href: '#finale' },
        { label: 'Plan your visit', href: '#night', ghost: true },
      ],
    },
  },
];

export const SEAMS: SeamSpec[] = [
  {
    id: 'seam-1',
    focus: 48,
    image: SEAM_IMAGES.seam1,
    fall: { x: 44.8, y: 2, w: 10.4, h: 90, speed: 1 },
  },
  {
    id: 'seam-2',
    focus: 40,
    image: SEAM_IMAGES.seam2,
    fall: { x: 21.4, y: 22, w: 10.6, h: 74, speed: 1 },
  },
  {
    id: 'seam-3',
    focus: 66,
    image: SEAM_IMAGES.seam3,
    fall: { x: 60.8, y: 46, w: 13.6, h: 50, speed: 1 },
  },
  {
    id: 'seam-4',
    focus: 45,
    image: SEAM_IMAGES.seam4,
  },
];
