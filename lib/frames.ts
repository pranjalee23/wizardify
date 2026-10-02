// The two frame sizes, as shown on The Frame page's pricing cards and in their details pop-up.
// Facts still to be confirmed show as placeholders in brackets, as in the design.
export type FrameStyle = 'gold' | 'black'

// Both sizes start at the same price
export const startingPrice = '₹11,999'

export type FrameTier = {
  id: 'keep' | 'heir'
  kind: string
  name: string
  size: string
  img: string
  alt: string
  initial: FrameStyle
  features: string[]
  details: {
    kind: string
    h: string
    w: string
    specs: [string, string][]
    box: string[]
    care: string[]
    note: string
  }
}

const common: [string, string][] = [
  ['Orientation', 'Portrait'],
  ['Playback', 'Up to 6 clips, 2 minutes, looped'],
  ['Display', 'LED screen'],
  ['Power', 'Plugs into a standard power outlet'],
  ['Warranty', '6 months'],
]

export const frameTiers: FrameTier[] = [
  {
    id: 'keep',
    kind: 'Tabletop',
    name: 'The Keepsake',
    size: '49.9 × 30.2 cm · stands on its own, or hangs on the wall',
    img: '/images/portrait-keeper-of-keys.jpg',
    alt: 'A portrait of a keeper of keys',
    initial: 'black',
    features: [
      'Up to 6 clips, 2 minutes of magic',
      'Stands on its own, or hangs with the included hooks and mounting kit',
      'Plugs into a standard power outlet',
    ],
    details: {
      kind: 'Tabletop · modern black by default',
      h: '49.9 cm',
      w: '30.2 cm',
      specs: [['Size', '49.9 × 30.2 cm'], ['Depth', '3 in (7.6 cm)'], ['Weight', '2.5 kg'], ['Mounting', 'Stands on its own on a desk or shelf. To hang it, wall hooks and a mounting kit are included'], ...common],
      box: ['Wizardify frame with your portrait', 'Wall hooks and mounting kit', 'Power adapter and cable', 'Setup guide', 'A handwritten card'],
      care: [
        'Dust the frame with a soft, dry cloth.',
        'Wipe the screen gently with a dry microfibre cloth, with the frame unplugged.',
        'Keep it out of direct sunlight and away from kitchens and bathrooms.',
        'On a desk or shelf, stand it on a flat, stable surface, away from the edge.',
        'Unplug it if you will be away for a while.',
      ],
      note: 'The matte black frame stands on its own on desks, shelves and bedside tables, or hangs on the wall if you prefer. Prefer antique gold? You can switch at no extra cost.',
    },
  },
  {
    id: 'heir',
    kind: 'Wall',
    name: 'The Heirloom',
    size: '49.9 × 30.2 cm · made for the wall',
    img: '/images/portrait.jpg',
    alt: 'A portrait of a young witch before a castle at dusk',
    initial: 'gold',
    features: ['Up to 6 clips, 2 minutes of magic', 'Wall-mounting kit included', 'Plugs into a standard power outlet'],
    details: {
      kind: 'Wall · antique gold by default',
      h: '49.9 cm',
      w: '30.2 cm',
      specs: [['Size', '49.9 × 30.2 cm'], ['Depth', '3 in (7.6 cm)'], ['Weight', '2.5 kg'], ['Mounting', 'Wall-mounting kit included'], ...common],
      box: ['Wizardify frame with your portrait', 'Wall-mounting kit', 'Power adapter and cable', 'Setup guide', 'A handwritten card'],
      care: [
        'Dust the frame with a soft, dry brush or cloth. Never spray cleaner on the gold finish.',
        'Wipe the screen gently with a dry microfibre cloth, with the frame unplugged.',
        'Keep it out of direct sunlight and away from kitchens and bathrooms.',
        'Lift it by the frame, not the screen.',
        'Unplug it if you will be away for a while.',
      ],
      note: 'Every gold-dusted frame is finished by hand, so small variations in the gilding are part of its character. Prefer modern black? You can switch at no extra cost.',
    },
  },
]
