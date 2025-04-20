"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { MoreVertical, Trash, Archive, RefreshCw } from "lucide-react";
import { ChatInput } from "./chat-input";
import { ChatMessage, Message, MessageRole } from "./chat-message";
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
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
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

  // Keep scrolling to bottom during streaming
  useEffect(() => {
    if (bottomRef.current && (isStreaming || !isInitialLoad)) {
      bottomRef.current.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" });
    }
  }, [messages, isInitialLoad, streamingMessage, isStreaming]);

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
        // Simulate a streaming response
        setIsStreaming(true);
        
        // Create an initial empty streaming message
        const aiMessageId = uuidv4();
        const aiMessage: Message = {
          id: aiMessageId,
          role: "assistant",
          content: "",
          createdAt: new Date(),
        };
        
        setStreamingMessage(aiMessage);
        
        // Simulate streaming by adding characters gradually
        const fullResponse = `I received your message: "${content}". This is a simulated streaming response. In a real app, this would be connected to an actual AI streaming API.`;
        let currentContent = "";
        
        for (let i = 0; i < fullResponse.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 15)); // Adjust speed as needed
          currentContent += fullResponse[i];
          setStreamingMessage({
            ...aiMessage,
            content: currentContent
          });
        }
        
        // Add the complete message to the messages array
        setMessages(prev => [...prev, {
          ...aiMessage,
          content: fullResponse
        }]);
        
        // Reset streaming state
        setStreamingMessage(null);
        setIsStreaming(false);
        return;
      }
      
      // For real API calls with streaming
      try {
        // Set up for streaming
        setIsStreaming(true);
        
        // Create an initial empty streaming message
        const aiMessageId = uuidv4();
        const streamingAiMessage: Message = {
          id: aiMessageId,
          role: "assistant",
          content: "",
          createdAt: new Date(),
        };
        
        setStreamingMessage(streamingAiMessage);
        
        // Send the message to the API with streaming response
        const response = await fetch(`/api/chats/${chatId}/messages/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        // Get user message ID from headers if available
        const userMessageId = response.headers.get('X-User-Message-Id') || uuidv4();
        
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let responseText = '';
        
        if (!reader) {
          throw new Error("Response body reader could not be created");
        }
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          responseText += chunk;
          
          // Update the streaming message content
          setStreamingMessage({
            ...streamingAiMessage,
            content: responseText
          });
        }
        
        // Update the user message with real ID
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== tempUserMessage.id),
          {
            id: userMessageId,
            role: "user",
            content: content,
            createdAt: new Date()
          },
          {
            ...streamingAiMessage,
            content: responseText
          }
        ]);
      } catch (error) {
        console.error("Error with streaming:", error);
        
        // Fallback to non-streaming API if streaming fails
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
          throw new Error(`Error: ${response.status} ${response.statusText}`);
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
      } finally {
        setStreamingMessage(null);
        setIsStreaming(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the optimistic message if the request failed
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chat actions
  const handleDeleteChat = async () => {
    if (!chatId) return;
    
    if (confirm("Are you sure you want to delete this chat?")) {
      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          // Redirect to main chat page after deletion
          window.location.href = "/chat";
        } else {
          console.error("Failed to delete chat");
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
  };
  
  const handleArchiveChat = async () => {
    if (!chatId) return;
    
    alert("Archive functionality will be implemented soon");
    // Implementation would be similar to delete but with a different API endpoint
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
      {/* Sidebar trigger at top left */}
      <div className="absolute top-4 left-4 z-20">
        <SidebarTrigger 
          className="h-10 w-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md flex items-center justify-center shadow-sm" 
        />
      </div>
      
      {/* Action buttons at top right */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-10 px-4 bg-white shadow-sm border-gray-200"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 bg-white shadow-sm border-gray-200"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer flex items-center"
              onClick={handleDeleteChat}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer flex items-center"
              onClick={handleArchiveChat}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Chat messages area - now taking full viewport height minus input area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="w-full max-w-screen-md mx-auto space-y-4 p-4 md:p-6 pt-16">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Render streaming message */}
            {streamingMessage && (
              <ChatMessage key={streamingMessage.id} message={streamingMessage} />
            )}
            
            {/* Loading indicator */}
            {isLoading && !isStreaming && (
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

      {/* Input area - simplified without title and sidebar trigger */}
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
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || isStreaming} />
        </div>
      </div>
    </div>
  );
} 