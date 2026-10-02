// Portrait previews. While previews are made by hand, members get up to two rounds of changes, so up
// to three previews each (see the reminder to revisit this once previews are automated).
export const MAX_PREVIEWS = 3
export const MAX_VIDEO_MB = 50
export const videoTypes = { 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm' } as const
export type VideoType = keyof typeof videoTypes

// How many rounds of changes a member has left after a given preview
export const changesLeft = (round: number) => Math.max(0, MAX_PREVIEWS - round)
