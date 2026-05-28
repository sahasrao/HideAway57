export const DEFAULT_AVATAR_BODY = "#67c8ca";
export const DEFAULT_AVATAR_ACCENT = "#404ba0";

export type AvatarTheme = {
  bodyColor: string;
  accentColor: string;
};

export const AVATAR_PRESETS: { id: string; label: string; bodyColor: string; accentColor: string }[] = [
  { id: "bluraz", label: "BluRaz", bodyColor: "#67c8ca", accentColor: "#404ba0" },
  { id: "raspberry", label: "Raspberry", bodyColor: "#e91e8c", accentColor: "#4a1942" },
  { id: "orange", label: "Orange", bodyColor: "#f97316", accentColor: "#7c2d12" },
  { id: "grape", label: "Grape", bodyColor: "#a855f7", accentColor: "#581c87" },
  { id: "lime", label: "Lime", bodyColor: "#84cc16", accentColor: "#365314" },
  { id: "lemon", label: "Lemon", bodyColor: "#facc15", accentColor: "#854d0e" },
];

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function hexToHue(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return h;
}

/** Hue-shift the official PNG toward the chosen body color. */
export function avatarImageFilter(bodyColor: string) {
  const rotate = hexToHue(bodyColor) - hexToHue(DEFAULT_AVATAR_BODY);
  if (Math.abs(rotate) < 2) return undefined;
  return `hue-rotate(${rotate.toFixed(1)}deg) saturate(1.08)`;
}

export function normalizeAvatarTheme(
  bodyColor?: string | null,
  accentColor?: string | null
): AvatarTheme {
  return {
    bodyColor:
      bodyColor && HEX_COLOR.test(bodyColor) ? bodyColor : DEFAULT_AVATAR_BODY,
    accentColor:
      accentColor && HEX_COLOR.test(accentColor)
        ? accentColor
        : DEFAULT_AVATAR_ACCENT,
  };
}
