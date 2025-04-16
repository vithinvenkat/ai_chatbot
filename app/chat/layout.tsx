import { Navbar } from "../components/chat/navbar";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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