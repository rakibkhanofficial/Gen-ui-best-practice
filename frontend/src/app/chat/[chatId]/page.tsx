import { ChatContainer } from "@/app/chat/ChatContainer";

interface DynamicChatPageProps {
  params: Promise<{ chatId: string }>;
}

export default async function DynamicChatPage({ params }: DynamicChatPageProps) {
  const resolvedParams = await params;
  return <ChatContainer initialChatId={resolvedParams.chatId} />;
}

