"use client";

import React, { Suspense } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { FullPageChatSkeleton } from "@/components/chat/ChatSessionSkeleton";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<FullPageChatSkeleton />}>
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
