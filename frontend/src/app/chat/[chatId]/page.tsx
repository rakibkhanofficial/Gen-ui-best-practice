import { Suspense } from "react";
import { ChatContainer } from "@/app/chat/ChatContainer";
import { FullPageChatSkeleton } from "@/components/chat/ChatSessionSkeleton";

interface DynamicChatPageProps {
  params: Promise<{ chatId: string }>;
}

async function ChatPageContent({ params }: DynamicChatPageProps) {
  const resolvedParams = await params;
  return <ChatContainer initialChatId={resolvedParams.chatId} />;
}

export default function DynamicChatPage({ params }: DynamicChatPageProps) {
  return (
    <Suspense fallback={<FullPageChatSkeleton />}>
      <ChatPageContent params={params} />
    </Suspense>
  );
}

