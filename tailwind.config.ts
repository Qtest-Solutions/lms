import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direction B: Conversational & Soft palette
        background: "#fcf8fb",
        foreground: "#1c1b1d",

        surface: "#FAFAFC",
        surfaceDim: "#E5E1E4",
        surfaceBright: "#FAFAFC",
        surfaceContainerLowest: "#FFFFFF",
        surfaceContainerLow: "#F5F0F5",
        surfaceContainer: "#E8E4E9",
        surfaceContainerHigh: "#D9D5DB",
        surfaceContainerHighest: "#CCC8CC",

        onSurface: "#2D3748",
        onSurfaceVariant: "#4A5568",
        inverseSurface: "#313032",
        inverseOnSurface: "#F4F0F2",

        outline: "#78767D",
        outlineVariant: "#C8C5CD",

        surfaceTint: "#BF5700",

        primary: "#BF5700",
        onPrimary: "#FFFFFF",
        primaryContainer: "#FFF5E9",
        onPrimaryContainer: "#6B3F00",

        secondary: "#884D52",
        onSecondary: "#FFFFFF",
        secondaryContainer: "#FFB3B8",
        onSecondaryContainer: "#7A4247",

        tertiary: "#D69E2E",
        onTertiary: "#1F1F1F",
        tertiaryContainer: "#FFF7E4",
        onTertiaryContainer: "#6B5200",

        error: "#EF4444",
        onError: "#FFFFFF",
        errorContainer: "#FEE2E2",
        onErrorContainer: "#991B1B",

        success: "#22C55E",
        onSuccess: "#FFFFFF",
        successContainer: "#DCFCE7",
        onSuccessContainer: "#059669",

        warning: "#F59E0B",
        onWarning: "#1F1F1F",
        warningContainer: "#FFFBEB",
        onWarningContainer: "#92400E",
      },
      borderRadius: {
        sm: "0.25rem",
        default: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        cardHover: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        elevated: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;