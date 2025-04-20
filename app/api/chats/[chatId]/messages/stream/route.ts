import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connect } from "../../../../../../lib/db";
import Chat from "../../../../../../lib/modals/Chat";
import Message from "../../../../../../lib/modals/Message";
import mongoose from "mongoose";

// Helper to create a readable stream from the AI response
function createReadableStream(content: string, delay: number = 15) {
  const chunks = content.split('');
  let index = 0;
  
  return new ReadableStream({
    start(controller) {
      function push() {
        if (index < chunks.length) {
          controller.enqueue(new TextEncoder().encode(chunks[index]));
          index++;
          setTimeout(push, delay);
        } else {
          controller.close();
        }
      }
      
      push();
    }
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const chatId = params.chatId;
    
    // Validate chatId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json(
        { error: "Invalid chat ID" },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connect();
    
    // Verify the chat belongs to the user
    const chat = await Chat.findOne({ _id: chatId, userId });
    
    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }
    
    try {
      // Parse the request to get the message content
      const { content } = await request.json();
      
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json(
          { error: "Message content is required" },
          { status: 400 }
        );
      }
      
      // Save the user message
      const userMessage = await Message.create({
        chatId,
        role: "user",
        content,
        userId
      });
      
      // Generate the AI response
      // In a real app, this would call an AI API with streaming support
      // For this example, we'll simulate a response
      const aiResponseContent = `Thank you for your message: "${content}". This is a simulated AI response using server-side streaming. In a production environment, this would be connected to an actual AI service with streaming capabilities.`;
      
      // Create the AI message in the database
      const aiMessage = await Message.create({
        chatId,
        role: "assistant",
        content: aiResponseContent,
        userId
      });
      
      // Create a stream for the AI response
      const stream = createReadableStream(aiResponseContent);
      
      // Return the streaming response
      const headers = new Headers();
      headers.set('Content-Type', 'text/plain; charset=utf-8');
      headers.set('Transfer-Encoding', 'chunked');
      headers.set('X-User-Message-Id', userMessage._id.toString());
      headers.set('X-AI-Message-Id', aiMessage._id.toString());
      
      return new Response(stream, {
        headers,
        status: 200,
      });
      
    } catch (error) {
      console.error("Error processing message:", error);
      return NextResponse.json(
        { error: "Error processing message" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 