"use client";

import { UserIcon } from "lucide-react";
import { cn } from "../../../lib/utils";

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("py-6", isUser ? "bg-background" : "bg-secondary/50")}>
      <div className={cn(
        "mx-auto max-w-2xl sm:px-6 md:px-8",
        isUser ? "flex justify-end" : "flex"
      )}>
        {!isUser && (
          <div className="flex-shrink-0 mr-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.29 7 12 12 20.71 7" />
                <line x1="12" y1="22" x2="12" y2="12" />
              </svg>
            </div>
          </div>
        )}
        
        <div className={cn(
          "flex flex-col",
          isUser ? "max-w-[75%] items-end" : "flex-1"
        )}>
          <div className={cn(
            "mb-1 font-semibold",
            isUser ? "text-right" : ""
          )}>
            {isUser ? "You" : "AI Assistant"}
          </div>
          <div className={cn(
            "prose prose-sm",
            isUser ? "p-3 bg-primary/10 rounded-lg" : "max-w-none"
          )}>
            {message.content}
          </div>
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 ml-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="h-5 w-5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}