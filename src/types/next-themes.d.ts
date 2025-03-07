
declare module "next-themes" {
  export interface ThemeProviderProps {
    forcedTheme?: string | undefined;
    disableTransitionOnChange?: boolean | undefined;
    enableSystem?: boolean | undefined;
    enableColorScheme?: boolean | undefined;
    storageKey?: string | undefined;
    themes?: string[] | undefined;
    defaultTheme?: string | undefined;
    attribute?: string | undefined | "class";
    value?: Record<string, string> | undefined;
    children?: React.ReactNode;
    nonce?: string | undefined;
  }

  export function useTheme(): {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    forcedTheme: string | undefined;
    resolvedTheme: string | undefined;
    themes: string[];
    systemTheme: "light" | "dark" | undefined;
  };

  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
}
