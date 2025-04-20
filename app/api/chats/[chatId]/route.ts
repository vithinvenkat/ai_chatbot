import { auth } from "@clerk/nextjs/server";
import { connect } from "../../../../lib/db";
import Chat from "../../../../lib/modals/Chat";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Get a single chat by ID
export async function GET(
  request: Request,
  context: { params: { chatId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Access params through context
    const { chatId } = context.params;
    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    // Validate chatId format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: "Invalid chat ID format" }, { status: 400 });
    }

    await connect();
    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Update a chat
export async function PATCH(
  request: Request,
  context: { params: { chatId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Access params through context
    const { chatId } = context.params;
    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    // Validate chatId format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: "Invalid chat ID format" }, { status: 400 });
    }

    const { title } = await request.json();
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    await connect();
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { title },
      { new: true }
    );

    if (!updatedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: "Failed to update chat", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Delete a chat
export async function DELETE(
  request: Request,
  context: { params: { chatId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Access params through context
    const { chatId } = context.params;
    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    // Validate chatId format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: "Invalid chat ID format" }, { status: 400 });
    }

    await connect();
    const result = await Chat.findOneAndDelete({ _id: chatId, userId });

    if (!result) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Chat deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 