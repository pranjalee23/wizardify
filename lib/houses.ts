export type HouseId = 'emberwyn' | 'tidesong' | 'nightbloom' | 'stonecrest'

export type House = {
  id: HouseId
  name: string
  title: string
  motto: string
  traits: string
  description: string
  img: string
  video: string
  alt: string
  cardAlt: string
  core: string
  border: string
  banner: string
}

export const houses: House[] = [
  {
    id: 'emberwyn',
    name: 'EMBERWYN',
    title: 'Emberwyn',
    motto: 'Where warmth burns bright.',
    traits: 'Warmth. Wit. Wonder.',
    description:
      'Emberwyns are the spark in every room and the first to pull up a chair by the fire. Storytellers, mischief-makers and quick-witted friends with a fox\'s grin. If you laugh easily, love fiercely and say yes to an adventure before you\'ve heard the plan, you might just be an Emberwyn.',
    img: '/images/house-emberwyn.jpg',
    video: '/videos/fox.mp4',
    alt: 'A fox by a roaring fire in an ember-lit hall',
    cardAlt: 'An ember-lit hall with candles',
    core: '#6B2A0E',
    border: '#B4561F',
    banner: '#8E3F15',
  },
  {
    id: 'tidesong',
    name: 'TIDESONG',
    title: 'Tidesong',
    motto: 'Still waters, deep minds.',
    traits: 'Calm. Curiosity. Depth.',
    description:
      'Tidesongs hear what the sea is saying and notice what everyone else misses. Readers, thinkers and patient solvers of impossible puzzles, as wise and watchful as an owl. If you find your calm by the water, ask the questions nobody else thinks to ask and always keep a book within reach, you might just be a Tidesong.',
    img: '/images/house-tidesong.jpg',
    video: '/videos/owl.mp4',
    alt: 'A snowy owl by a moonlit sea-view window',
    cardAlt: 'A moonlit sea-view hall in teal light',
    core: '#0B3C42',
    border: '#2A8A92',
    banner: '#0F4950',
  },
  {
    id: 'nightbloom',
    name: 'NIGHTBLOOM',
    title: 'Nightbloom',
    motto: 'Magic lives after dark.',
    traits: 'Dreams. Mystery. Intuition.',
    description:
      'Nightblooms come alive when the candles are lit and the first stars appear. Dreamers, stargazers and quiet believers in things unseen, drawn to the moonlight like a moth. If you trust your instincts, love the night sky and see magic in the in-between, you might just be a Nightbloom.',
    img: '/images/house-nightbloom.jpg',
    video: '/videos/butterfly.mp4',
    alt: 'A moth beneath a starlit observatory dome',
    cardAlt: 'A violet observatory under the stars',
    core: '#2E1846',
    border: '#7A4FA8',
    banner: '#3B2156',
  },
  {
    id: 'stonecrest',
    name: 'STONECREST',
    title: 'Stonecrest',
    motto: 'The ones who stay.',
    traits: 'Strength. Steadiness. Heart.',
    description:
      'Stonecrests are the ones who stay when the storm rolls in. Protectors, builders and keepers of old promises, with the strength of the mountain and the heart of a bear. If you\'re the friend people call at midnight, value loyalty over glory and always save a seat by the hearth, you might just be a Stonecrest.',
    img: '/images/house-stonecrest.jpg',
    video: '/videos/bear.mp4',
    alt: 'A bear resting by a stone hearth',
    cardAlt: 'A copper-lit stone hall',
    core: '#2C3036',
    border: '#C07A4A',
    banner: '#474B52',
  },
]

export const houseById = (id: string | undefined) => houses.find((h) => h.id === id)

export const examplePortraits = [
  { src: '/images/portrait-stargazer.jpg', alt: 'A witch with her snowy owl' },
  { src: '/images/portrait-fox-whisperer.jpg', alt: 'A boy with a fox' },
  { src: '/images/portrait-keeper-of-keys.jpg', alt: 'A smiling woman in robes' },
  { src: '/images/portrait-sleeping-fox.jpg', alt: 'A fox asleep in a glowing den' },
  { src: '/images/portrait-spellcaster.jpg', alt: 'A woman touched by a glowing wand' },
]
