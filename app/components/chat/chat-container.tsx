"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatInput } from "./chat-input";
import { ChatMessage, Message, MessageRole } from "./chat-message";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { useSidebar } from "../ui/sidebar";

interface ChatContainerProps {
  chatId?: string;
}

interface ApiMessage {
  _id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

interface Chat {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
}

// Default welcome message for new chats
const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hello! How can I help you today?",
  createdAt: new Date(),
};

export function ChatContainer({ chatId }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { state, isMobile } = useSidebar();
  
  // Heights for positioning calculations
  const inputHeight = 80; // Approximate height of input area in pixels

  // Fetch chat details if chatId is provided
  useEffect(() => {
    if (!chatId) {
      setChat(null);
      setMessages([welcomeMessage]);
      setIsInitialLoad(false);
      return;
    }

    async function fetchChatDetails() {
      try {
        const response = await fetch(`/api/chats/${chatId}`);
        if (!response.ok) {
          console.error("Error fetching chat details:", response.statusText);
          return null;
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching chat details:", error);
        return null;
      }
    }

    async function fetchMessages() {
      try {
        const response = await fetch(`/api/chats/${chatId}/messages`);
        if (!response.ok) {
          console.error("Error fetching messages:", response.statusText);
          return [welcomeMessage];
        }
        
        const apiMessages: ApiMessage[] = await response.json();
        
        // Convert API messages to local format
        const formattedMessages: Message[] = apiMessages.map(msg => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.createdAt)
        }));
        
        return formattedMessages.length > 0 ? formattedMessages : [welcomeMessage];
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [welcomeMessage];
      }
    }

    async function loadData() {
      setIsInitialLoad(true);
      setIsLoading(true);

      const [chatData, messagesData] = await Promise.all([
        fetchChatDetails(),
        fetchMessages()
      ]);

      setChat(chatData);
      setMessages(messagesData);
      
      setIsInitialLoad(false);
      setIsLoading(false);
    }
    
    loadData();
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current && !isInitialLoad) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isInitialLoad]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Optimistically add user message to UI
    const tempUserMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      createdAt: new Date(),
    };
    
    setMessages(prev => [...prev, tempUserMessage]);
    setIsLoading(true);
    
    try {
      if (!chatId) {
        // Handle the case where we're in the general chat page
        // Just simulate a response
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const aiMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: `I received your message: "${content}". This is a placeholder response. In a real app, this would be replaced with an actual AI response.`,
          createdAt: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        return;
      }
      
      // Send the message to the API
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      });

      if (!response.ok) {
        console.error("Error sending message:", response.statusText);
        // Remove the optimistic message if the request failed
        setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
        return;
      }

      const data = await response.json();
      
      // Replace the optimistic message with the actual one from the server
      // and add the AI response
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== tempUserMessage.id),
        {
          id: data.userMessage._id,
          role: data.userMessage.role,
          content: data.userMessage.content,
          createdAt: new Date(data.userMessage.createdAt)
        },
        {
          id: data.aiMessage._id,
          role: data.aiMessage.role,
          content: data.aiMessage.content,
          createdAt: new Date(data.aiMessage.createdAt)
        }
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the optimistic message if the request failed
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoad) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-5 w-36 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chat messages area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-64px-80px)]">
          <div className="w-full max-w-screen-md mx-auto space-y-4 p-4 md:p-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="py-4 w-full">
                <div className="flex">
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
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} className="h-10" />
          </div>
        </ScrollArea>
      </div>

      {/* Input area - fixed at bottom with dynamic positioning based on sidebar state */}
      <div 
        className="fixed bottom-0 border-t border-gray-200 bg-gray-50 shadow-lg z-20 transition-all duration-300 ease-in-out py-3 px-4"
        style={{
          left: isMobile 
            ? 0 
            : state === "expanded" 
              ? "16rem" // Width of expanded sidebar
              : "3rem",  // Width of collapsed sidebar
          right: 0,
          height: `${inputHeight}px`,
        }}
      >
        <div className="w-full max-w-screen-md mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
} 