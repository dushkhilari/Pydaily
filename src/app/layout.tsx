import type { Metadata } from "next";
import { Baloo_2, Nunito, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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

export const metadata: Metadata = {
  title: "PyDaily — Learn Python in 100 Days",
  description:
    "A skeuomorphic study desk for the 100 Days of Python course. Leather-bound lessons, runnable code on an LCD bench, notes, bookmarks, streaks and quizzes.",
  keywords: ["Python", "learn python", "100 days of code", "study", "course"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${body.variable} ${display.variable} ${jetMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
