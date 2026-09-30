// Members' photos for their portrait: what the form accepts and the server allows (the storage
// bucket enforces the same types and size, in supabase/migrations).
export const MAX_PHOTOS = 8
export const MAX_PHOTO_MB = 20
export const photoTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
} as const
export type PhotoType = keyof typeof photoTypes
