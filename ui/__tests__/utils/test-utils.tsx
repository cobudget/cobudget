import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "../../lib/createEmotionCache";
import messages from "../../lang/en.json";

const muiTheme = createTheme();
const emotionCache = createEmotionCache();

interface AllProvidersProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that provides all necessary context providers for testing
 */
function AllProviders({ children }: AllProvidersProps) {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={muiTheme}>
        <IntlProvider locale="en" messages={messages}>
          {children}
        </IntlProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

/**
 * Custom render function that wraps components with all providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override the default render with our custom one
export { customRender as render };
