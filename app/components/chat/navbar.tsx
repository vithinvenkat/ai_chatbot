"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../../../components/ui/sheet";

export function Navbar() {
  return (
    <div className="fixed top-0 w-full z-50 flex justify-between items-center py-2 px-4 border-b h-16 bg-background">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-gray-900 p-0">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
            <Link href="/chat" className="flex items-center">
              <h1 className="text-xl font-semibold text-white">
                AI Chatbot
              </h1>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Chat history list will go here */}
            <div className="p-4 space-y-2">
              <div className="text-sm text-gray-400">No chat history yet</div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <UserButton afterSignOutUrl="/" />
              <button className="text-sm text-white hover:text-gray-300">
                New Chat
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Title (shown only on mobile) */}
      <div className="md:hidden flex items-center flex-1 justify-center">
        <h1 className="text-xl font-semibold">AI Chatbot</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-x-3 md:hidden">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
} 