"use client";

import { UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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
  const formattedTime = message.createdAt instanceof Date 
    ? message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={cn("flex w-full", isUser && "justify-end")}>
      <div className={cn(
        "flex items-start gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row",
        isUser ? "pr-2" : "pl-2"
      )}>
        {isUser ? (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-gray-300 text-gray-600">
              <UserIcon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-green-100 text-green-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.29 7 12 12 20.71 7" />
                <line x1="12" y1="22" x2="12" y2="12" />
              </svg>
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn(
          "flex flex-col flex-1",
          isUser ? "items-end" : "items-start",
          "max-w-[80%]"
        )}>
          <div className={cn(
            "p-3 md:p-4 rounded-lg shadow-sm",
            isUser 
              ? "bg-gray-800 text-white rounded-tr-none" 
              : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
          )}>
            <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
          <div className="text-xs text-gray-500 mt-1 px-1 opacity-80">
            {isUser ? 'You' : 'AI Assistant'} • {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
}