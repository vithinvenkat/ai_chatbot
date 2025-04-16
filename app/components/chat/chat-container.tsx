"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatInput } from "./chat-input";
import { ChatMessage, Message, MessageRole } from "./chat-message";

// Example initial messages
const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! How can I help you today?",
    createdAt: new Date(),
  },
];

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      createdAt: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Simulate AI response (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Add AI response
      const aiMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `I received your message: "${content}". This is a placeholder response. In a real app, this would be replaced with an actual AI response.`,
        createdAt: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error (show error message, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="py-6 bg-secondary/50">
            <div className="flex mx-auto max-w-2xl sm:px-6 md:px-8">
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
                    className="h-5 w-5 animate-pulse"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.29 7 12 12 20.71 7" />
                    <line x1="12" y1="22" x2="12" y2="12" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-1">AI Assistant</div>
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
} 