"use client"

import { Home, MessageSquare, Plus, MoreVertical, Trash, Edit } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface Chat {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
}

// Function to group chats by date categories
const groupChatsByDate = (chats: Chat[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const pastWeekStart = new Date(today);
  pastWeekStart.setDate(pastWeekStart.getDate() - 7);
  
  const pastMonthStart = new Date(today);
  pastMonthStart.setDate(pastMonthStart.getDate() - 30);
  
  // Sort chats by date (newest first)
  const sortedChats = [...chats].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Group by date categories
  const groups = {
    today: [] as Chat[],
    yesterday: [] as Chat[],
    pastWeek: [] as Chat[],
    pastMonth: [] as Chat[],
    older: [] as Chat[]
  };
  
  sortedChats.forEach(chat => {
    const chatDate = new Date(chat.createdAt);
    
    if (chatDate >= today) {
      groups.today.push(chat);
    } else if (chatDate >= yesterday) {
      groups.yesterday.push(chat);
    } else if (chatDate >= pastWeekStart) {
      groups.pastWeek.push(chat);
    } else if (chatDate >= pastMonthStart) {
      groups.pastMonth.push(chat);
    } else {
      groups.older.push(chat);
    }
  });
  
  return groups;
};

// Function to format chat date for display
const formatChatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Check if the date is today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Otherwise return date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

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

  // Function to delete a chat
  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (confirm("Are you sure you want to delete this chat?")) {
      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          method: "DELETE"
        })
        
        if (response.ok) {
          setChatHistory(prev => prev.filter(chat => chat._id !== chatId))
          
          // If the deleted chat is the active one, redirect to main chat page
          if (isActiveChat(chatId)) {
            router.push("/chat")
          }
        } else {
          console.error("Failed to delete chat")
        }
      } catch (error) {
        console.error("Error deleting chat:", error)
      }
    }
  }
  
  // Function to rename a chat
  const handleRenameChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const chat = chatHistory.find(c => c._id === chatId)
    if (!chat) return
    
    const newTitle = prompt("Enter new chat title:", chat.title)
    if (!newTitle || newTitle === chat.title) return
    
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: newTitle })
      })
      
      if (response.ok) {
        setChatHistory(prev => 
          prev.map(c => c._id === chatId ? {...c, title: newTitle} : c)
        )
      } else {
        console.error("Failed to rename chat")
      }
    } catch (error) {
      console.error("Error renaming chat:", error)
    }
  }

  // Check if a chat is active
  const isActiveChat = (chatId: string) => pathname === `/chat/${chatId}`
  
  // Group chats by date
  const groupedChats = groupChatsByDate(chatHistory);

  // Render a chat item with actions
  const renderChatItem = (chat: Chat) => (
    <SidebarMenuItem key={chat._id} className="group/item relative">
      <SidebarMenuButton 
        asChild 
        tooltip={chat.title}
        isActive={isActiveChat(chat._id)}
        className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Link href={`/chat/${chat._id}`} className="flex items-center gap-2 pr-10">
          <MessageSquare className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 truncate">{chat.title}</span>
        </Link>
      </SidebarMenuButton>
      
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem 
              onClick={(e) => handleRenameChat(chat._id, e)}
              className="cursor-pointer flex items-center gap-2 text-sm"
            >
              <Edit className="h-3.5 w-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => handleDeleteChat(chat._id, e)}
              className="cursor-pointer flex items-center gap-2 text-sm text-red-600 focus:text-red-600"
            >
              <Trash className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SidebarMenuItem>
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <span className="text-xl font-semibold">AI Chatbot</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Main navigation items - commented out
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
        */}

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
            {chatHistory.length === 0 ? (
              <div className="px-2 py-1 text-sm text-gray-500">
                No chats yet
              </div>
            ) : (
              <div className="space-y-4">
                {/* Today's chats - no heading for today */}
                {groupedChats.today.length > 0 && (
                  <SidebarMenu>
                    {groupedChats.today.map(renderChatItem)}
                  </SidebarMenu>
                )}
                
                {/* Yesterday's chats */}
                {groupedChats.yesterday.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-gray-500">
                      Yesterday
                    </div>
                    <SidebarMenu>
                      {groupedChats.yesterday.map(renderChatItem)}
                    </SidebarMenu>
                  </>
                )}
                
                {/* Past Week */}
                {groupedChats.pastWeek.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-gray-500">
                      Past Week
                    </div>
                    <SidebarMenu>
                      {groupedChats.pastWeek.map(renderChatItem)}
                    </SidebarMenu>
                  </>
                )}
                
                {/* Past Month */}
                {groupedChats.pastMonth.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-gray-500">
                      Past Month
                    </div>
                    <SidebarMenu>
                      {groupedChats.pastMonth.map(renderChatItem)}
                    </SidebarMenu>
                  </>
                )}
                
                {/* Older */}
                {groupedChats.older.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-gray-500">
                      Older
                    </div>
                    <SidebarMenu>
                      {groupedChats.older.map(renderChatItem)}
                    </SidebarMenu>
                  </>
                )}
              </div>
            )}
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