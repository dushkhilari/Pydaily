"use client";

import { useSyncExternalStore } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

/** SSR-safe hydration flag: false on the server, true after hydration.
 *  Avoids both hydration mismatches and setState-inside-effect. */
const subscribeNoop = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

/**
 * Light / dark switch — styled like a small paper key. The icons are
 * swapped purely via the `dark:` CSS variant (no hydration-sensitive
 * markup); the state attributes wait for hydration so the first client
 * render always matches the server output.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  const isDark = hydrated && resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle light or dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "btn3d btn-paper flex h-10 w-10 items-center justify-center rounded-xl",
        className
      )}
    >
      <Sun className="hidden h-[18px] w-[18px] text-pen-amber dark:block" aria-hidden />
      <Moon className="h-[18px] w-[18px] text-pen-blue dark:hidden" aria-hidden />
    </button>
  );
}
