"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { CopilotKit } from "@copilotkit/react-core";
import {
  FullPageChatSkeleton,
  FullPageEmptyChatSkeleton,
} from "@/components/chat/ChatSessionSkeleton";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Specific skeleton selection: empty state skeleton on /chat vs session history skeleton on /chat/[chatId]
  const isDetailsPage =
    pathname && pathname !== "/chat" && pathname.startsWith("/chat/");
  const FallbackSkeleton = isDetailsPage
    ? FullPageChatSkeleton
    : FullPageEmptyChatSkeleton;

  return (
    <Suspense fallback={<FallbackSkeleton />}>
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
