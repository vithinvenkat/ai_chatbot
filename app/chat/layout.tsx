"use client"

import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar"
import { AppSidebar } from "../components/app-sidebar"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Using a component to handle redirect properly
  function RedirectToHome() {
    useEffect(() => {
      redirect('/')
    }, [])
    return null
  }

  return (
    <>
      <SignedIn>
        <SidebarProvider>
          <div className="flex h-screen bg-gray-50 w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col w-full">
              <header className="h-16 border-b bg-gray-50 flex items-center px-4 shadow-sm w-full">
                <SidebarTrigger />
                <h1 className="text-xl font-medium ml-4 hidden md:block">AI Chatbot</h1>
              </header>
              <main className="flex-1 overflow-auto w-full">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </SignedIn>
      
      <SignedOut>
        <RedirectToHome />
      </SignedOut>
    </>
  )
}
