import { auth } from "@clerk/nextjs/server";
import { connect } from "../../../lib/db";
import Chat from "../../../lib/modals/Chat";
import { NextResponse } from "next/server";

// Get all chats for the current user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();
    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
    
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

// Create a new chat
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body with a fallback
    let title;
    try {
      const body = await req.json();
      title = body.title;
    } catch (e) {
      title = `Chat ${new Date().toLocaleTimeString()}`;
    }

    // Connect to database
    await connect();
    
    // Create new chat
    const newChat = await Chat.create({
      userId,
      title,
      createdAt: new Date()
    });

    return NextResponse.json(newChat, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat", details: (error as Error).message },
      { status: 500 }
    );
  }
} 