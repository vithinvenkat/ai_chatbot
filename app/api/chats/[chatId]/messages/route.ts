import { auth } from "@clerk/nextjs/server";
import { connect } from "../../../../../lib/db";
import Chat from "../../../../../lib/modals/Chat";
import Message from "../../../../../lib/modals/Message";
import { NextResponse } from "next/server";

// Get messages for a chat
export async function GET(
  req: Request,
  context: { params: { chatId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatId = context.params.chatId;
    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    await connect();
    
    // Verify that the chat belongs to the user
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Get messages for the chat
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// Create a new message
export async function POST(
  req: Request,
  context: { params: { chatId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatId = context.params.chatId;
    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    // Verify that the chat belongs to the user
    await connect();
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Get the message content from request body
    let content;
    try {
      const body = await req.json();
      content = body.content;
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Create the user message
    const userMessage = await Message.create({
      chatId,
      userId,
      role: "user",
      content,
      createdAt: new Date()
    });

    // TODO: Connect to AI model for responses
    // For now, send a mock response
    const aiMessage = await Message.create({
      chatId,
      role: "assistant",
      content: "This is a demo response. AI integration will be added soon.",
      createdAt: new Date()
    });

    return NextResponse.json(
      { userMessage, aiMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
} 