import { auth } from "@clerk/nextjs/server";
import { connect } from "../../../../../lib/db";
import Chat from "../../../../../lib/modals/Chat";
import Message from "../../../../../lib/modals/Message";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Get messages for a chat
export async function GET(
  request: Request,
  context: { params: { chatId: string } }
) {
  console.log("[API] GET /api/chats/[chatId]/messages - Starting request");
  
  try {
    // Access params through context
    const { chatId } = context.params;
    console.log("[API] Chat ID from params:", chatId);
    
    const { userId } = await auth();
    console.log("[API] User ID from auth:", userId);
    
    if (!userId) {
      console.log("[API] Unauthorized - No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!chatId) {
      console.log("[API] Missing chat ID in params");
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    // Validate chatId format
    console.log("[API] Validating chat ID format:", chatId);
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      console.log("[API] Invalid chat ID format:", chatId);
      return NextResponse.json({ error: "Invalid chat ID format" }, { status: 400 });
    }

    console.log("[API] Connecting to MongoDB...");
    await connect();
    console.log("[API] MongoDB connection established");
    
    // Verify that the chat belongs to the user
    console.log("[API] Finding chat with ID:", chatId, "and user ID:", userId);
    const chat = await Chat.findOne({ _id: chatId, userId });
    
    if (!chat) {
      console.log("[API] Chat not found or does not belong to user");
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    
    console.log("[API] Chat found:", chat._id);

    // Get messages for the chat
    console.log("[API] Fetching messages for chat ID:", chatId);
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    console.log("[API] Found", messages.length, "messages");
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error("[API] Error in GET /api/chats/[chatId]/messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Create a new message
export async function POST(
  request: Request,
  context: { params: { chatId: string } }
) {
  console.log("[API] POST /api/chats/[chatId]/messages - Starting request");
  
  try {
    // Access params through context
    const params = await context.params;
    const { chatId } = params;
    console.log("[API] Chat ID from params:", chatId);
    
    const { userId } = await auth();
    console.log("[API] User ID from auth:", userId);
    
    if (!userId) {
      console.log("[API] Unauthorized - No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!chatId) {
      console.log("[API] Missing chat ID in params");
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    // Validate chatId format
    console.log("[API] Validating chat ID format:", chatId);
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      console.log("[API] Invalid chat ID format:", chatId);
      return NextResponse.json({ error: "Invalid chat ID format" }, { status: 400 });
    }

    // Verify that the chat belongs to the user
    console.log("[API] Connecting to MongoDB...");
    await connect();
    console.log("[API] MongoDB connection established");
    
    console.log("[API] Finding chat with ID:", chatId, "and user ID:", userId);
    const chat = await Chat.findOne({ _id: chatId, userId });
    
    if (!chat) {
      console.log("[API] Chat not found or does not belong to user");
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    
    console.log("[API] Chat found:", chat._id);

    // Get the message content from request body
    let content;
    try {
      console.log("[API] Parsing request body");
      const body = await request.json();
      content = body.content;
      console.log("[API] Message content:", content ? `${content.substring(0, 50)}...` : "undefined");
    } catch (e) {
      console.error("[API] Error parsing request body:", e);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!content) {
      console.log("[API] Missing message content");
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Create the user message
    console.log("[API] Creating user message");
    const userMessage = await Message.create({
      chatId,
      userId,
      role: "user",
      content,
      createdAt: new Date()
    });
    console.log("[API] User message created with ID:", userMessage._id);

    // TODO: Connect to AI model for responses
    // For now, send a mock response
    console.log("[API] Creating AI response message");
    const aiMessage = await Message.create({
      chatId,
      role: "assistant",
      content: "This is a demo response. AI integration will be added soon.",
      createdAt: new Date()
    });
    console.log("[API] AI message created with ID:", aiMessage._id);

    return NextResponse.json(
      { userMessage, aiMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Error in POST /api/chats/[chatId]/messages:", error);
    return NextResponse.json(
      { error: "Failed to create message", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}