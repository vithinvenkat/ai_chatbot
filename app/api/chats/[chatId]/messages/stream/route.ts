import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connect } from "../../../../../../lib/db";
import Chat from "../../../../../../lib/modals/Chat";
import Message from "../../../../../../lib/modals/Message";
import mongoose from "mongoose";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "not-needed",
  baseURL: "http://localhost:8000/v1", // vLLM server URL
});

export async function POST(
  request: NextRequest,
  context: { params: { chatId: string } }
) {
  try {
    const { params } = context;
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    await connect();

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const body = await request.json();
    const content = body.content;

    console.log("[REQUEST BODY]", body);

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const userMessage = await Message.create({
      chatId,
      role: "user",
      content,
      userId,
    });

    const stream = await openai.chat.completions.create({
      model: "Qwen/Qwen2-0.5B-Instruct",
      messages: [{ role: "user", content }],
      stream: true,
    });

    const encoder = new TextEncoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const token = chunk.choices?.[0]?.delta?.content || "";
          console.log("[STREAM TOKEN]", token);
          fullResponse += token;
          controller.enqueue(encoder.encode(token));
        }

        controller.close();

        // Save the AI response to DB
        await Message.create({
          chatId,
          role: "assistant",
          content: fullResponse,
          userId,
        });
        console.log("[AI MESSAGE SAVED]");
      },
    });

    const headers = new Headers();
    headers.set("Content-Type", "text/plain; charset=utf-8");
    headers.set("Transfer-Encoding", "chunked");

    return new Response(readable, {
      headers,
      status: 200,
    });

  } catch (error) {
    console.error("Error in /stream:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
