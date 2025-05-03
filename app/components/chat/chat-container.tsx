"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { MoreVertical, Trash, Archive, RefreshCw } from "lucide-react";
import { ChatInput } from "./chat-input";
import { ChatMessage, Message } from "./chat-message";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { useSidebar, SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useSidebar();

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
        if (!response.ok) throw new Error(response.statusText);
        return await response.json();
      } catch (error) {
        console.error("Error fetching chat:", error);
        return null;
      }
    }

    async function fetchMessages() {
      try {
        const response = await fetch(`/api/chats/${chatId}/messages`);
        if (!response.ok) throw new Error(response.statusText);
        const apiMessages: ApiMessage[] = await response.json();
        const formatted: Message[] = apiMessages.map(msg => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.createdAt),
        }));
        return formatted.length > 0 ? formatted : [welcomeMessage];
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
        fetchMessages(),
      ]);
      setChat(chatData);
      setMessages(messagesData);
      setIsInitialLoad(false);
      setIsLoading(false);
    }

    loadData();
  }, [chatId]);

  useEffect(() => {
    if (bottomRef.current && !isInitialLoad) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isInitialLoad]);

  useEffect(() => {
    if (bottomRef.current && (isStreaming || !isInitialLoad)) {
      bottomRef.current.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" });
    }
  }, [messages, streamingMessage, isStreaming]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const tempUserMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      if (!chatId) throw new Error("Chat ID is missing.");

      setIsStreaming(true);

      const aiMessageId = uuidv4();
      const streamingAiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };
      setStreamingMessage(streamingAiMessage);

      const response = await fetch(`/api/chats/${chatId}/messages/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Streaming error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let responseText = "";

      if (!reader) throw new Error("Missing reader");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        responseText += chunk;
        setStreamingMessage({ ...streamingAiMessage, content: responseText });
      }

      setMessages(prev => [...prev, { ...streamingAiMessage, content: responseText }]);
    } catch (error) {
      console.error("Stream error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setStreamingMessage(null);
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!chatId) return;
    if (confirm("Are you sure you want to delete this chat?")) {
      try {
        const res = await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
        if (res.ok) window.location.href = "/chat";
        else throw new Error("Failed to delete chat");
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleArchiveChat = async () => {
    if (!chatId) return;
    alert("Archive functionality will be implemented soon.");
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
    <div className="flex flex-col h-full w-full relative">
      <div className="absolute top-4 left-4 z-20">
        <SidebarTrigger className="h-10 w-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md flex items-center justify-center shadow-sm" />
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
        <Button variant="outline" size="sm" className="h-10 px-4 bg-white shadow-sm border-gray-200" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 bg-white shadow-sm border-gray-200">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-red-600" onClick={handleDeleteChat}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchiveChat}>
              <Archive className="mr-2 h-4 w-4" /> Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="w-full max-w-screen-md mx-auto space-y-4 p-4 md:p-6 pt-16">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {streamingMessage && <ChatMessage key={streamingMessage.id} message={streamingMessage} />}
            {isLoading && !isStreaming && (
              <div className="py-4 w-full flex items-center space-x-4">
                <Skeleton className="h-4 w-24" />
              </div>
            )}
            <div ref={bottomRef} className="h-10" />
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-gray-200 p-4">
        <ChatInput isLoading={isLoading || isStreaming} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
