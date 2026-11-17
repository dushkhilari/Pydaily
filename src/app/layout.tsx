import type { Metadata } from "next";
import { Baloo_2, Nunito, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/study/theme-toggle";

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

const display = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
});

const jetMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const hand = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PyDaily — Your Python Notebook",
  description:
    "A 100-day Python course kept like a notebook: ruled paper pages, handwritten tips, quizzes, exercises and a real in-browser Python Code Lab powered by Pyodide (WebAssembly).",
  keywords: ["Python", "learn python", "100 days of code", "study", "course", "playground", "pyodide"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${body.variable} ${display.variable} ${jetMono.variable} ${hand.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
