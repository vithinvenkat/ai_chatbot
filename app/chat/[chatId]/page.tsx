"use client"

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";

interface Message {
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

export default function ChatDetail() {
  const params = useParams();
  const chatId = params.chatId as string;
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch chat data and messages
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch chat details
        const chatResponse = await fetch(`/api/chats/${chatId}`);
        if (!chatResponse.ok) {
          throw new Error("Failed to fetch chat");
        }
        const chatData = await chatResponse.json();
        setChat(chatData);
        
        // Fetch messages
        const messagesResponse = await fetch(`/api/chats/${chatId}/messages`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (chatId) {
      fetchData();
    }
  }, [chatId]);

  // Send a message
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || sending) return;
    
    try {
      setSending(true);
      
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      
      // Add both user and AI messages to the state
      setMessages((prev) => [...prev, data.userMessage, data.aiMessage]);
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium">Chat not found</h3>
          <p className="text-gray-500 mt-2">
            The chat you are looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold">{chat.title}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto border rounded-md p-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet. Start chatting!</p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-100 ml-auto max-w-[80%]"
                    : "bg-gray-200 mr-auto max-w-[80%]"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input 
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button 
            type="submit"
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              sending
                ? "bg-gray-400 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
} 