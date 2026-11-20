/**
 * Generates an SVG data URL for profile photo fallback
 */
export function getFallbackAvatarSvg(name: string, accentHex: string = "#FFE1D1"): string {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <rect width="600" height="800" fill="${accentHex}"/>
    <circle cx="300" cy="360" r="140" fill="#FFFFFF" stroke="#14101F" stroke-width="12"/>
    <text x="300" y="415" font-family="'Bricolage Grotesque', sans-serif" font-size="160" font-weight="800" fill="#14101F" text-anchor="middle">${initial}</text>
    <circle cx="200" cy="650" r="16" fill="#14101F" opacity="0.15"/>
    <circle cx="250" cy="650" r="16" fill="#14101F" opacity="0.15"/>
    <circle cx="300" cy="650" r="16" fill="#FF3D80"/>
    <circle cx="350" cy="650" r="16" fill="#14101F" opacity="0.15"/>
    <circle cx="400" cy="650" r="16" fill="#14101F" opacity="0.15"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const ACCENT_COLORS: Record<string, { bg: string; border: string; pillBg: string }> = {
  blue: { bg: "#D9EBFF", border: "#14101F", pillBg: "#EBF3FF" },
  peach: { bg: "#FFE1D1", border: "#14101F", pillBg: "#FFF0E8" },
  lavender: { bg: "#E6DFFF", border: "#14101F", pillBg: "#F2EEFF" },
  yellow: { bg: "#FFE14D", border: "#14101F", pillBg: "#FFF3A8" },
  mint: { bg: "#CDF3DC", border: "#14101F", pillBg: "#E5F9ED" },
};
