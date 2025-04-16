"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function Navbar() {
  return (
    <div className="fixed top-0 w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <h1 className="text-xl md:text-2xl font-bold text-primary">
            AI Chatbot
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
} 