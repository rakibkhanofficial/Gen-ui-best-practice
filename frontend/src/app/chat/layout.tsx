"use client";

import React, { Suspense } from "react";
import { CopilotKit } from "@copilotkit/react-core";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        transcribeAudioUrl="/api/copilotkit/transcribe"
        enableInspector={true}
        showDevConsole={true}
      >
        {children}
      </CopilotKit>
    </Suspense>
  );
}
