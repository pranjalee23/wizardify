export const filters = [
  ['all', 'All'],
  ['emberwyn', 'Emberwyn'],
  ['tidesong', 'Tidesong'],
  ['nightbloom', 'Nightbloom'],
  ['stonecrest', 'Stonecrest'],
  ['skyball', 'Skyball'],
  ['mentor', 'Mentors'],
] as const

type Portrait = { name: string; house: string; tags: string[]; src: string; alt: string }

export const portraits: Portrait[] = [
  { name: 'The Charms Student', house: 'Nightbloom', tags: ['nightbloom'], src: '/images/portrait.jpg', alt: 'A young witch with a wand before a castle at dusk' },
  { name: 'The Fox Whisperer', house: 'Emberwyn', tags: ['emberwyn'], src: '/images/portrait-fox-whisperer.jpg', alt: 'A boy in a green cloak with a fox' },
  { name: 'The Stargazer', house: 'Tidesong', tags: ['tidesong'], src: '/images/portrait-stargazer.jpg', alt: 'A young woman with a snowy owl by a moonlit window' },
  { name: 'The Keeper of Keys', house: 'Stonecrest', tags: ['stonecrest', 'mentor'], src: '/images/portrait-keeper-of-keys.jpg', alt: 'A smiling woman in crimson robes' },
  { name: 'The Spellcaster', house: 'Emberwyn', tags: ['emberwyn', 'skyball'], src: '/images/portrait-spellcaster.jpg', alt: 'A woman in red robes touched by a glowing wand' },
  { name: 'The Librarian', house: 'Tidesong', tags: ['tidesong', 'mentor'], src: '/images/portrait-librarian.jpg', alt: 'A woman in crimson robes, warmly lit' },
  { name: 'The Loyal Companion', house: 'Stonecrest', tags: ['stonecrest'], src: '/images/portrait-loyal-companion.jpg', alt: 'A golden retriever portrait' },
  { name: 'The Sleeping Fox', house: 'Nightbloom', tags: ['nightbloom', 'skyball'], src: '/images/portrait-sleeping-fox.jpg', alt: 'A fox curled up in a glowing den' },
]
