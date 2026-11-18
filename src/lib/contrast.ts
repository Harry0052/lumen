function channel(hex: string, start: number) {
  const value = parseInt(hex.slice(start, start + 2), 16) / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function contrastRatio(foreground: string, background: string) {
  const lum = (hex: string) =>
    0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
  const lighter = Math.max(lum(foreground), lum(background));
  const darker = Math.min(lum(foreground), lum(background));
  return (lighter + 0.05) / (darker + 0.05);
}

export const palette = {
  paper: "#FBFAF6",
  ink: "#20272B",
  blue: "#2764C9",
  white: "#FFFFFF",
  muted: "#3E474C",
  caution: "#8A4B12",
  cautionBg: "#F8E8D4",
  highBlue: "#0B3F91",
} as const;
