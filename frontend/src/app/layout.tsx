import type { Metadata } from "next";
import { Suspense } from "react";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Generative UI Studio | Google Antigravity & CopilotKit",
  description:
    "Enterprise-grade Generative UI demonstration platform featuring dynamic component mounting, agent reasoning, and human-in-the-loop approval workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="bg-slate-950 text-slate-100 antialiased min-h-screen"
        suppressHydrationWarning
      >
        <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
