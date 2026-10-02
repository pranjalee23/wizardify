export const routes = {
  home: '/',
  frame: '/frame',
  pricing: '/frame#pricing',
  howItWorks: '/how-it-works',
  houses: '/houses',
  house: (id: string) => `/houses/${id}`,
  gallery: '/gallery',
  faq: '/faq',
  privacy: '/privacy',
  terms: '/terms',
  drop: '/drop',
  reserve: (step: number) => `/reserve/${step}`,
} as const
