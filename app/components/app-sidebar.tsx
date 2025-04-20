"use client"

import { Home, MessageSquare, Plus } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { UserButton } from "@clerk/nextjs"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import { Button } from "./ui/button"

interface Chat {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
}

export function AppSidebar() {
  const [chatHistory, setChatHistory] = useState<Chat[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Fetch existing chats on load
  useEffect(() => {
    async function fetchChats() {
      try {
        const response = await fetch("/api/chats")
        if (response.ok) {
          const chats = await response.json()
          setChatHistory(chats)
        }
      } catch (error) {
        console.error("Error fetching chats:", error)
      }
    }
    
    fetchChats()
  }, [])

  // Function to create a new chat
  const createNewChat = async () => {
    try {
      setLoading(true)
      
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Chat ${new Date().toLocaleTimeString()}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error creating chat:", errorData.error || response.statusText)
        return
      }

      const newChat = await response.json()
      setChatHistory((prevHistory) => [...prevHistory, newChat])
      router.push(`/chat/${newChat._id}`)
    } catch (error) {
      console.error("Error creating chat:", error)
    } finally {
      setLoading(false)
    }
  }

  // Check if a chat is active
  const isActiveChat = (chatId: string) => pathname === `/chat/${chatId}`
  const isActivePath = (path: string) => pathname === path
  
  // Main menu items
  const mainItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: pathname === "/"
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageSquare,
      isActive: pathname === "/chat"
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <span className="text-xl font-semibold">AI Chatbot</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    isActive={item.isActive}
                  >
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between">
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={createNewChat}
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">New Chat</span>
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatHistory.length === 0 ? (
                <div className="px-2 py-1 text-sm text-gray-500">
                  No chats yet
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <SidebarMenuItem key={chat._id}>
                    <SidebarMenuButton 
                      asChild 
                      tooltip={chat.title}
                      isActive={isActiveChat(chat._id)}
                    >
                      <Link href={`/chat/${chat._id}`} className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{chat.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between p-2">
          <UserButton afterSignOutUrl="/" />
          <span className="text-xs text-gray-500">v1.0.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 