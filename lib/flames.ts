// Candle flames in the site's photographs, so they can be made to flicker (components/Flicker).
// Each flame is [centre x, centre y, height] in the image's own pixels. Found with scripts/flames/detect.mjs,
// then checked by eye: glints on brass and glass removed, and blurred or dim flames it missed added.
type ImageFlames = { w: number; h: number; flames: [number, number, number][] }

export const imageFlames: Record<string, ImageFlames> = {
  // The lit room behind the inner pages (from designs/hero/room-lit.png); its three candles on the left
  '/images/room-lit.webp': {
    w: 1672,
    h: 941,
    flames: [
      [260, 427, 34],
      [195, 472, 30],
      [142, 545, 32],
    ],
  },
  '/images/sky-study.jpg': {
    w: 1672,
    h: 941,
    flames: [
      [562, 206, 10],
      [106, 288, 20],
      [121, 280, 22],
      [140, 299, 25],
      [713, 322, 16],
      [699, 334, 12],
      [726, 335, 12],
      [221, 375, 31],
      [196, 393, 29],
      [501, 400, 20],
      [434, 409, 14],
      [24, 461, 20],
      [1229, 459, 14],
      [1187, 461, 17],
      [1171, 481, 21],
      [63, 492, 26],
      [409, 496, 35],
      [384, 535, 48],
      [1450, 559, 46],
      [1061, 654, 27],
      [563, 676, 17],
      [1575, 716, 48],
      [165, 880, 54],
      [1665, 318, 18],
    ],
  },
  '/images/house-emberwyn.jpg': {
    w: 557,
    h: 701,
    flames: [
      [43, 209, 25],
      [485, 290, 21],
      [175, 419, 121],
      [174, 450, 58],
      [33, 510, 31],
      [52, 509, 26],
      [18, 236, 14],
      [78, 388, 16],
    ],
  },
  '/images/house-tidesong.jpg': {
    w: 557,
    h: 701,
    flames: [
      [436, 92, 31],
      [29, 217, 12],
      [516, 433, 64],
      [66, 477, 23],
    ],
  },
  '/images/house-nightbloom.jpg': {
    w: 556,
    h: 701,
    flames: [
      [149, 155, 17],
      [531, 283, 19],
      [88, 283, 23],
      [39, 367, 19],
      [378, 487, 58],
    ],
  },
  '/images/house-stonecrest.jpg': {
    w: 555,
    h: 701,
    flames: [
      [70, 100, 17],
      [338, 227, 12],
      [367, 372, 17],
      [7, 428, 29],
      [40, 514, 23],
      [147, 549, 73],
    ],
  },
  '/images/deco-gallery-left.webp': {
    w: 497,
    h: 469,
    flames: [
      [207, 50, 58],
    ],
  },
}
