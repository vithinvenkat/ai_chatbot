"use client";

import { useState, useRef, useEffect } from "react";
import { SendIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";

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
    <div className="border-t bg-background py-4 px-4 sm:px-6 md:px-8">
      <form onSubmit={handleSubmit} className="relative mx-auto max-w-2xl">
        <div className="relative rounded-lg border shadow-sm focus-within:ring-1 focus-within:ring-primary">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI..."
            className="max-h-[200px] min-h-[48px] w-full resize-none border-0 bg-transparent p-3 pr-12 outline-none focus-visible:ring-0"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className={`absolute bottom-1 right-1 ${
              message.trim() && !isLoading ? "text-primary" : "text-muted-foreground"
            }`}
            disabled={!message.trim() || isLoading}
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
} 