import { Suspense } from "react";
import { ChatContainer } from "@/app/chat/ChatContainer";
import { FullPageEmptyChatSkeleton } from "@/components/chat/ChatSessionSkeleton";

export default function ChatPage() {
  return (
    <Suspense fallback={<FullPageEmptyChatSkeleton />}>
      <ChatContainer key="new-chat-root" />
    </Suspense>
  );
}
