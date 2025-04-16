"use client";

import { SignedIn, SignedOut } from '@clerk/nextjs';
import { redirect } from "next/navigation";

export default function ChatPage() {
  return (
    <SignedIn>
      <div className="h-full p-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Chat</h2>
          <p className="text-muted-foreground">
            Start a conversation with the AI
          </p>
        </div>
        <div className="h-[calc(100vh-12rem)] rounded-lg border">
          {/* Chat messages will go here */}
        </div>
      </div>
    </SignedIn>
  );
} 