"use client"

import { SidebarProvider } from "../components/ui/sidebar"
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
              <main className="h-full w-full">
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
