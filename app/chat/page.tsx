"use client";

import { SignedIn } from '@clerk/nextjs';
import { ChatContainer } from "../components/chat/chat-container";

export default function ChatPage() {
  return (
    <SignedIn>
      <div className="h-full">
        <ChatContainer />
      </div>
    </SignedIn>
  );
} 