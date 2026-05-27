/** Hi-fidelity Figma card exports (415×294 desktop components). */
export function getFeaturedCardImage(gameId: string) {
  return `/games/cards/${gameId}.png`;
}

export const FEATURED_GAME_IDS = [
  "raspberry-boi",
  "cookie-bubble",
  "donut-duelers",
  "froot-shooter",
  "enchanting-broccoli",
  "western-roller",
] as const;
