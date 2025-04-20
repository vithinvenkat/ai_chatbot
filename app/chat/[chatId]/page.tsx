import { ChatContainer } from "@/app/components/chat/chat-container";

export default function ChatDetailPage({ params }: { params: { chatId: string } }) {
  return (
    <div className="h-full">
      <ChatContainer chatId={params.chatId} />
    </div>
  );
} 