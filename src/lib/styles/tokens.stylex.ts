import * as stylex from "@stylexjs/stylex";

/** Shared surfaces and semantic colors, following the system color scheme. */
export const theme = stylex.defineVars({
  base100: {
    default: "oklch(100% 0 0)",
    "@media (prefers-color-scheme: dark)": "oklch(25.33% 0.016 252.42)",
  },
  base200: {
    default: "oklch(98% 0 0)",
    "@media (prefers-color-scheme: dark)": "oklch(23.26% 0.014 253.1)",
  },
  base300: {
    default: "oklch(95% 0 0)",
    "@media (prefers-color-scheme: dark)": "oklch(21.15% 0.012 254.09)",
  },
  baseContent: {
    default: "oklch(21% 0.006 285.885)",
    "@media (prefers-color-scheme: dark)": "oklch(97.807% 0.029 256.847)",
  },
  primary: {
    default: "oklch(45% 0.24 277.023)",
    "@media (prefers-color-scheme: dark)": "oklch(58% 0.233 277.117)",
  },
  primaryContent: {
    default: "oklch(93% 0.034 272.788)",
    "@media (prefers-color-scheme: dark)": "oklch(96% 0.018 272.314)",
  },
  secondary: {
    default: "oklch(65% 0.241 354.308)",
    "@media (prefers-color-scheme: dark)": "oklch(65% 0.241 354.308)",
  },
  secondaryContent: {
    default: "oklch(94% 0.028 342.258)",
    "@media (prefers-color-scheme: dark)": "oklch(94% 0.028 342.258)",
  },
  accent: {
    default: "oklch(77% 0.152 181.912)",
    "@media (prefers-color-scheme: dark)": "oklch(77% 0.152 181.912)",
  },
  accentContent: {
    default: "oklch(38% 0.063 188.416)",
    "@media (prefers-color-scheme: dark)": "oklch(38% 0.063 188.416)",
  },
  neutral: {
    default: "oklch(14% 0.005 285.823)",
    "@media (prefers-color-scheme: dark)": "oklch(14% 0.005 285.823)",
  },
  neutralContent: {
    default: "oklch(92% 0.004 286.32)",
    "@media (prefers-color-scheme: dark)": "oklch(92% 0.004 286.32)",
  },
  info: {
    default: "oklch(74% 0.16 232.661)",
    "@media (prefers-color-scheme: dark)": "oklch(74% 0.16 232.661)",
  },
  infoContent: {
    default: "oklch(29% 0.066 243.157)",
    "@media (prefers-color-scheme: dark)": "oklch(29% 0.066 243.157)",
  },
  success: {
    default: "oklch(76% 0.177 163.223)",
    "@media (prefers-color-scheme: dark)": "oklch(76% 0.177 163.223)",
  },
  successContent: {
    default: "oklch(37% 0.077 168.94)",
    "@media (prefers-color-scheme: dark)": "oklch(37% 0.077 168.94)",
  },
  warning: {
    default: "oklch(82% 0.189 84.429)",
    "@media (prefers-color-scheme: dark)": "oklch(82% 0.189 84.429)",
  },
  warningContent: {
    default: "oklch(41% 0.112 45.904)",
    "@media (prefers-color-scheme: dark)": "oklch(41% 0.112 45.904)",
  },
  error: {
    default: "oklch(71% 0.194 13.428)",
    "@media (prefers-color-scheme: dark)": "oklch(71% 0.194 13.428)",
  },
  errorContent: {
    default: "oklch(27% 0.105 12.094)",
    "@media (prefers-color-scheme: dark)": "oklch(27% 0.105 12.094)",
  },
});
