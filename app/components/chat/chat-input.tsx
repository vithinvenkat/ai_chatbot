"use client";

import { useState, useRef, useEffect } from "react";
import { SendIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px"; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + "px";
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  // Handle Enter key press (submit on Enter, new line on Shift+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center rounded-lg border border-gray-300 bg-white shadow-sm focus-within:ring-1 focus-within:ring-gray-400 focus-within:border-gray-400">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="resize-none pr-12 border-0 shadow-none focus-visible:ring-0 min-h-[48px] max-h-[200px] md:min-h-[56px]"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || isLoading}
          className="absolute right-2 bg-gray-800 hover:bg-gray-900 text-white rounded-full h-8 w-8 md:h-10 md:w-10 p-0 flex items-center justify-center transition-all"
          variant="ghost"
          aria-label="Send message"
        >
          <SendIcon className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Press Enter to send, Shift+Enter for a new line
      </p>
    </form>
  );
} 