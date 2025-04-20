"use client"

import { Navbar } from "../components/chat/navbar";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Chat {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch existing chats on load
  useEffect(() => {
    async function fetchChats() {
      try {
        const response = await fetch("/api/chats");
        if (response.ok) {
          const chats = await response.json();
          setChatHistory(chats);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }
    
    fetchChats();
  }, []);

  // Function to create a new chat
  const createNewChat = async () => {
    try {
      setLoading(true);
      
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Chat ${new Date().toLocaleTimeString()}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error creating chat:", errorData.error || response.statusText);
        return;
      }

      const newChat = await response.json();
      setChatHistory((prevHistory) => [...prevHistory, newChat]);
      router.push(`/chat/${newChat._id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full relative">
      {/* Sidebar */}
      <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 bg-gray-900">
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
          <Link href="/chat" className="flex items-center">
            <h1 className="text-xl font-semibold text-white">
              AI Chatbot
            </h1>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Chat history list */}
          <div className="p-4 space-y-2">
            {chatHistory.length === 0 ? (
              <div className="text-sm text-gray-400">No chat history yet</div>
            ) : (
              chatHistory.map((chat: any) => (
                <div key={chat._id} className="text-sm text-gray-300">
                  <Link href={`/chat/${chat._id}`} className="hover:text-white">
                    {chat.title}
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <UserButton afterSignOutUrl="/" />
            <button
              onClick={createNewChat}
              className="text-sm text-white hover:text-gray-300"
            >
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-72 h-full">
        <Navbar />
        <main className="pt-16 h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
