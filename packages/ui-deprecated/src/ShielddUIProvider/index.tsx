import { TooltipProvider } from '@radix-ui/react-tooltip';
import { ThemeProvider, DefaultTheme } from 'styled-components';
import { theme } from './theme';
import { PropsWithChildren } from 'react';
import { FontFaces } from './FontFaces';
import { MotionConfig } from 'framer-motion';

/**
 * Place at the root of your app, above all Shieldd UI components, to provide
 * a number of context values that they use.
 */
export const ShielddUIProvider = ({ children }: PropsWithChildren) => (
  <ThemeProvider theme={theme as DefaultTheme}>
    <MotionConfig transition={{ duration: 0.15 }}>
      <TooltipProvider delayDuration={0}>
        <FontFaces />

        {children}
      </TooltipProvider>
    </MotionConfig>
  </ThemeProvider>
);

export { theme } from './theme';
