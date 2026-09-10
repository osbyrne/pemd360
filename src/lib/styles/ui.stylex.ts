import * as stylex from "@stylexjs/stylex";
import { theme } from "./tokens.stylex";

/** Shared controls and state variants. Page layouts live alongside their components. */
export const ui = stylex.create({
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: ".375rem",
    flexShrink: 0,
    height: "2.5rem",
    paddingInline: "1rem",
    borderRadius: ".25rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: `color-mix(in oklab, ${theme.base300} 85%, black)`,
    backgroundColor: {
      default: theme.base200,
      ":hover": theme.base300,
    },
    color: theme.baseContent,
    fontSize: ".875rem",
    fontWeight: 600,
    textAlign: "center",
    verticalAlign: "middle",
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    opacity: {
      default: 1,
      ":disabled": 0.5,
    },
    boxShadow: "0 1px 2px #0000000d",
    textDecoration: "none",
    transitionProperty: "color, background-color, border-color, box-shadow, opacity",
    transitionDuration: "200ms",
    outlineWidth: {
      default: 0,
      ":focus-visible": "2px",
    },
    outlineStyle: "solid",
    outlineColor: "currentColor",
    outlineOffset: "2px",
  },
  buttonSmall: {
    height: "2rem",
    paddingInline: ".75rem",
    fontSize: ".75rem",
  },
  buttonGhost: {
    borderColor: "transparent",
    boxShadow: "none",
    backgroundColor: {
      default: "transparent",
      ":hover": `color-mix(in oklab, ${theme.baseContent} 10%, transparent)`,
    },
  },
  buttonOutline: {
    backgroundColor: {
      default: "transparent",
      ":hover": `var(--button-tone, ${theme.baseContent})`,
    },
    color: {
      default: `var(--button-tone, ${theme.baseContent})`,
      ":hover": `var(--button-tone-content, ${theme.base100})`,
    },
    borderColor: "currentColor",
    boxShadow: "none",
  },
  input: {
    appearance: "none",
    width: "20rem",
    maxWidth: "100%",
    height: "2.5rem",
    paddingInline: ".75rem",
    borderRadius: ".25rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: {
      default: `color-mix(in oklab, ${theme.baseContent} 20%, transparent)`,
      ":focus": "#10b981",
    },
    backgroundColor: theme.base100,
    fontSize: ".875rem",
    outlineWidth: {
      default: 0,
      ":focus-visible": "2px",
    },
    outlineStyle: "solid",
    outlineColor: "#10b981",
    outlineOffset: "2px",
    opacity: {
      default: 1,
      ":disabled": 0.5,
    },
    cursor: {
      default: "auto",
      ":disabled": "not-allowed",
    },
  },
  select: {
    appearance: "none",
    width: "20rem",
    maxWidth: "100%",
    height: "2.5rem",
    paddingInline: ".75rem",
    borderRadius: ".25rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: {
      default: `color-mix(in oklab, ${theme.baseContent} 20%, transparent)`,
      ":focus": "#10b981",
    },
    backgroundColor: theme.base100,
    fontSize: ".875rem",
    outlineWidth: {
      default: 0,
      ":focus-visible": "2px",
    },
    outlineStyle: "solid",
    outlineColor: "#10b981",
    outlineOffset: "2px",
    opacity: {
      default: 1,
      ":disabled": 0.5,
    },
    cursor: {
      default: "auto",
      ":disabled": "not-allowed",
    },
    paddingInlineEnd: "2rem",
    backgroundImage:
      "linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)",
    backgroundPosition: "calc(100% - 15px) 50%, calc(100% - 10px) 50%",
    backgroundSize: "5px 5px",
    backgroundRepeat: "no-repeat",
  },
  checkbox: {
    appearance: "auto",
    accentColor: theme.success,
    width: "1.5rem",
    height: "1.5rem",
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    verticalAlign: "middle",
    flexShrink: 0,
  },
  radio: {
    appearance: "auto",
    accentColor: theme.success,
    width: "1.5rem",
    height: "1.5rem",
    cursor: "pointer",
    verticalAlign: "middle",
    flexShrink: 0,
  },
  dialog: {
    display: {
      default: "none",
      ":is([open])": "grid",
    },
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    maxWidth: "none",
    maxHeight: "none",
    margin: 0,
    padding: 0,
    borderWidth: 0,
    placeItems: "center",
    backgroundColor: "transparent",
    color: "inherit",
    overflow: "clip",
    overscrollBehavior: "contain",
    zIndex: 999,
    "::backdrop": {
      backgroundColor: "#0006",
    },
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "#0006",
  },
  dialogPanel: {
    position: "relative",
    gridRowStart: 1,
    gridColumnStart: 1,
    width: "91.666667%",
    maxWidth: "32rem",
    maxHeight: "calc(100dvh - 2rem)",
    padding: "1.5rem",
    borderRadius: ".5rem",
    backgroundColor: theme.base100,
    color: theme.baseContent,
    overflowY: "auto",
    overscrollBehavior: "contain",
    boxShadow: "0 25px 50px -12px #0004",
  },
  dialogBackdrop: {
    display: "grid",
    gridRowStart: 1,
    gridColumnStart: 1,
    placeSelf: "stretch",
    zIndex: -1,
    color: "transparent",
  },
  dialogActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: ".5rem",
    marginTop: "1.5rem",
  },
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    borderRadius: ".5rem",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
    gap: ".5rem",
    padding: "1.5rem",
    fontSize: ".875rem",
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    gap: ".5rem",
    fontSize: "1.125rem",
    fontWeight: 600,
  },
  table: {
    position: "relative",
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    borderRadius: ".5rem",
    textAlign: "left",
    fontSize: ".875rem",
  },
  tableCell: {
    verticalAlign: "middle",
    paddingBlock: ".75rem",
    paddingInline: "1rem",
  },
  tableHeading: {
    whiteSpace: "nowrap",
    fontWeight: 600,
    color: `color-mix(in oklab, ${theme.baseContent} 60%, transparent)`,
  },
  tableRule: {
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: `color-mix(in oklab, ${theme.baseContent} 5%, transparent)`,
  },
  buttonGroup: {
    display: "inline-flex",
    alignItems: "stretch",
    borderRadius: ".25rem",
  },
  buttonGroupItem: {
    borderRadius: 0,
    marginInlineStart: {
      default: "-1px",
      ":first-child": 0,
    },
    borderStartStartRadius: {
      default: 0,
      ":first-child": ".25rem",
    },
    borderEndStartRadius: {
      default: 0,
      ":first-child": ".25rem",
    },
    borderStartEndRadius: {
      default: 0,
      ":last-child": ".25rem",
    },
    borderEndEndRadius: {
      default: 0,
      ":last-child": ".25rem",
    },
  },
  list: {
    display: "flex",
    flexDirection: "column",
    fontSize: ".875rem",
  },
  listRow: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    gap: "1rem",
    padding: "1rem",
    position: "relative",
    overflowWrap: "break-word",
  },
  toast: {
    position: "fixed",
    insetInlineEnd: "1rem",
    bottom: "1rem",
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    gap: ".5rem",
    width: "max-content",
    maxWidth: "calc(100vw - 2rem)",
  },
  alert: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    borderRadius: ".5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: theme.base200,
    backgroundColor: theme.base200,
    fontSize: ".875rem",
  },
  divideChild: {
    borderBottomWidth: {
      default: "1px",
      ":last-child": 0,
    },
    borderBottomStyle: "solid",
    borderBottomColor: "var(--divider-color, currentColor)",
  },
  buttonPrimary: {
    "--button-tone": theme.primary,
    "--button-tone-content": theme.primaryContent,
    color: theme.primaryContent,
    backgroundColor: {
      default: theme.primary,
      ":hover": `color-mix(in oklab, ${theme.primary} 90%, black)`,
    },
    borderColor: theme.primary,
  },
  buttonSecondary: {
    "--button-tone": theme.secondary,
    "--button-tone-content": theme.secondaryContent,
    color: theme.secondaryContent,
    backgroundColor: {
      default: theme.secondary,
      ":hover": `color-mix(in oklab, ${theme.secondary} 90%, black)`,
    },
    borderColor: theme.secondary,
  },
  buttonSuccess: {
    "--button-tone": theme.success,
    "--button-tone-content": theme.successContent,
    color: theme.successContent,
    backgroundColor: {
      default: theme.success,
      ":hover": `color-mix(in oklab, ${theme.success} 90%, black)`,
    },
    borderColor: theme.success,
  },
  buttonWarning: {
    "--button-tone": theme.warning,
    "--button-tone-content": theme.warningContent,
    color: theme.warningContent,
    backgroundColor: {
      default: theme.warning,
      ":hover": `color-mix(in oklab, ${theme.warning} 90%, black)`,
    },
    borderColor: theme.warning,
  },
  alertError: {
    color: theme.errorContent,
    backgroundColor: theme.error,
    borderColor: theme.error,
  },
  alertInfo: {
    color: theme.infoContent,
    backgroundColor: theme.info,
    borderColor: theme.info,
  },
  alertWarning: {
    color: theme.warningContent,
    backgroundColor: theme.warning,
    borderColor: theme.warning,
  },
  negativeTranslateXFull: {
    "--translate-x": "-100%",
    translate: "var(--translate-x, 0px) var(--translate-y, 0px)",
  },
  bgAmber100: {
    backgroundColor: "oklch(96.2% 0.059 95.617)",
  },
  bgAmber600: {
    backgroundColor: "oklch(66.6% 0.179 58.318)",
  },
  bgBlue100: {
    backgroundColor: "oklch(93.2% 0.032 255.585)",
  },
  bgEmerald100: {
    backgroundColor: "oklch(95% 0.052 163.051)",
  },
  bgEmerald50: {
    backgroundColor: "oklch(97.9% 0.021 166.113)",
  },
  bgEmerald500: {
    backgroundColor: "oklch(69.6% 0.17 162.48)",
  },
  bgGray500: {
    backgroundColor: "oklch(55.1% 0.027 264.364)",
  },
  bgGreen100: {
    backgroundColor: "oklch(96.2% 0.044 156.743)",
  },
  bgGreen600: {
    backgroundColor: "oklch(62.7% 0.194 149.214)",
  },
  bgOrange100: {
    backgroundColor: "oklch(95.4% 0.038 75.164)",
  },
  bgPurple100: {
    backgroundColor: "oklch(94.6% 0.033 307.174)",
  },
  bgRed100: {
    backgroundColor: "oklch(93.6% 0.032 17.717)",
  },
  bgRed50: {
    backgroundColor: "oklch(97.1% 0.013 17.38)",
  },
  bgWhiteOver50: {
    backgroundColor: "color-mix(in oklab, #fff 50%, transparent)",
  },
  border: {
    borderWidth: "1px",
    borderStyle: "solid",
  },
  borderEmerald200: {
    borderColor: "oklch(90.5% 0.093 164.15)",
  },
  borderEmerald500: {
    borderColor: "oklch(69.6% 0.17 162.48)",
  },
  borderGray300: {
    borderColor: "oklch(87.2% 0.01 258.338)",
  },
  borderPurple300: {
    borderColor: "oklch(82.7% 0.119 306.383)",
  },
  borderRed200: {
    borderColor: "oklch(88.5% 0.062 18.334)",
  },
  borderRed300: {
    borderColor: "oklch(80.8% 0.114 19.571)",
  },
  borderTransparent: {
    borderColor: "transparent",
  },
  h10: {
    height: "2.5rem",
  },
  h24: {
    height: "6rem",
  },
  hoverBgAmber50: {
    backgroundColor: {
      default: null,
      ":hover": "oklch(98.7% 0.022 95.277)",
    },
  },
  hoverBgAmber700: {
    backgroundColor: {
      default: null,
      ":hover": "oklch(55.5% 0.163 48.998)",
    },
  },
  hoverBgGreen50: {
    backgroundColor: {
      default: null,
      ":hover": "oklch(98.2% 0.018 155.826)",
    },
  },
  hoverBgGreen700: {
    backgroundColor: {
      default: null,
      ":hover": "oklch(52.7% 0.154 150.069)",
    },
  },
  hoverBgWhiteOver80: {
    backgroundColor: {
      default: null,
      ":hover": "color-mix(in oklab, #fff 80%, transparent)",
    },
  },
  hoverTextAmber600: {
    color: {
      default: null,
      ":hover": "oklch(66.6% 0.179 58.318)",
    },
  },
  hoverTextGreen700: {
    color: {
      default: null,
      ":hover": "oklch(52.7% 0.154 150.069)",
    },
  },
  objectContain: {
    objectFit: "contain",
  },
  opacity0: {
    opacity: 0,
  },
  opacity100: {
    opacity: 1,
  },
  pointerEventsNone: {
    pointerEvents: "none",
  },
  scale110: {
    scale: 1.1,
  },
  scale140: {
    scale: 1.4,
  },
  textAmber600: {
    color: "oklch(66.6% 0.179 58.318)",
  },
  textBlue600: {
    color: "oklch(54.6% 0.245 262.881)",
  },
  textBlue700: {
    color: "oklch(48.8% 0.243 264.376)",
  },
  textBlue800: {
    color: "oklch(42.4% 0.199 265.638)",
  },
  textEmerald500: {
    color: "oklch(69.6% 0.17 162.48)",
  },
  textEmerald600: {
    color: "oklch(59.6% 0.145 163.225)",
  },
  textEmerald700: {
    color: "oklch(50.8% 0.118 165.612)",
  },
  textEmerald800: {
    color: "oklch(43.2% 0.095 166.913)",
  },
  textGreen500: {
    color: "oklch(72.3% 0.219 149.579)",
  },
  textGreen600: {
    color: "oklch(62.7% 0.194 149.214)",
  },
  textGreen800: {
    color: "oklch(44.8% 0.119 151.328)",
  },
  textOrange800: {
    color: "oklch(47% 0.157 37.304)",
  },
  textPurple800: {
    color: "oklch(43.8% 0.218 303.724)",
  },
  textRed700: {
    color: "oklch(50.5% 0.213 27.518)",
  },
  textRed800: {
    color: "oklch(44.4% 0.177 26.899)",
  },
  transitionTransform: {
    transitionProperty: "transform, translate, scale, rotate",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  translateX0: {
    "--translate-x": "0rem",
    translate: "var(--translate-x, 0px) var(--translate-y, 0px)",
  },
  w10: {
    width: "2.5rem",
  },
  w24: {
    width: "6rem",
  },
  bgRed500: {
    backgroundColor: "oklch(63.7% 0.237 25.331)",
  },
  bgYellow500: {
    backgroundColor: "oklch(79.5% 0.184 86.047)",
  },
});
