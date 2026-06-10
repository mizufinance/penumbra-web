import { theme } from './ShielddUIProvider/theme';

/**
 * For consumers using Tailwind, this file exports a Tailwind config based on
 * the Shieldd UI theme values.
 */
export const tailwindConfig = {
  content: [],
  theme: {
    extend: {
      borderRadius: theme.borderRadius,
      colors: theme.color,
      fontFamily: theme.font,
      fontSize: theme.fontSize,
      lineHeight: theme.lineHeight,
      screens: Object.keys(theme.breakpoint).reduce(
        (prev, curr) => ({
          ...prev,
          [curr]: theme.breakpoint[curr as keyof (typeof theme)['breakpoint']].toString() + 'px',
        }),
        {},
      ),

      // No need to customize spacing, since Tailwind's default is the same as
      // Shieldd UI's.
    },
  },
} as const;
