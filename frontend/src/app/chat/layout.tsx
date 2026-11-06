"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { CopilotKit } from "@copilotkit/react-core/v2";
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
  const publicApiKey =
    process.env.NEXT_PUBLIC_COPILOTKIT_PUBLIC_API_KEY ||
    process.env.NEXT_PUBLIC_CPK_PUBLIC_API_KEY;

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
        publicApiKey={publicApiKey}
        transcribeAudioUrl="/api/copilotkit/transcribe"
        enableInspector={true}
      >
        {children}
      </CopilotKit>
    </Suspense>
  );
}
