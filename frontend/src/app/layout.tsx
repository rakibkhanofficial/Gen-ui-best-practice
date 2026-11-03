import type { Metadata } from "next";
import { Suspense } from "react";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Gemini Studio | Generative UI & Google Antigravity Agent",
  description:
    "Production-grade replica of Gemini / ChatGPT interface with dynamic Generative UI mounting, streaming reasoning stages, and multi-turn chat history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="bg-white dark:bg-[#131314] text-slate-900 dark:text-[#e3e3e3] antialiased min-h-screen selection:bg-blue-500/20"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#131314]" />}>
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
