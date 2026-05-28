/** Hi-fidelity Figma card exports (415×294 desktop components). */
export function getFeaturedCardImage(gameId: string) {
  return `/games/cards/${gameId}.png`;
}

/** Full-width game detail banners (3840×2220, 300 DPI). */
export function getGameBannerImage(gameId: string) {
  return `/games/banners/${gameId}.png`;
}

/** Wide 16:9 carousel banners (3840×2160, 300 DPI). */
export function getCarouselImage(gameId: string) {
  return `/games/carousel/${gameId}.png`;
}

export const FEATURED_GAME_IDS = [
  "raspberry-boi",
  "cookie-bubble",
  "donut-duelers",
  "froot-shooter",
  "enchanting-broccoli",
  "western-roller",
] as const;
