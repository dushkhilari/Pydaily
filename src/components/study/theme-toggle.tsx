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

/** SSR-safe hydration flag: false on the server, true after hydration. */
const subscribeNoop = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

/**
 * Light / dark switch — a neobrutalism toggle key: pill shell with a thick
 * ink border and hard shadow; the knob slides between sun (light / teal)
 * and moon (dark / purple) states exactly like the reference switch.
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
        "neo-btn relative h-10 w-[4.4rem] !rounded-full px-1",
        isDark ? "bg-nb-purple" : "bg-nb-teal",
        className
      )}
    >
      {/* sliding knob */}
      <span
        className={cn(
          "absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border-[2.5px] border-nb-border bg-nb-card shadow-hard-xs transition-all duration-200",
          isDark ? "left-[calc(100%-2rem)]" : "left-1"
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-nb-purple" aria-hidden />
        ) : (
          <Sun className="h-4 w-4 text-nb-orange" aria-hidden />
        )}
      </span>
    </button>
  );
}
