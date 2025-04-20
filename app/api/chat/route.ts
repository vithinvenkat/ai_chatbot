import { auth } from "@clerk/nextjs/server";
import { connect } from "../../../lib/db";
import Message from "../../../lib/modals/Message";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chatId, userMessage } = await req.json();
  await connect();

  // Save user message
  await Message.create({
    chatId,
    role: "user",
    content: userMessage,
  });

  // 🧠 Dummy GPT-like reply
  const botReply = `You said: "${userMessage}". I'm a dummy GPT.`;

  // Save dummy assistant reply
  await Message.create({
    chatId,
    role: "assistant",
    content: botReply,
  });

  return NextResponse.json({ reply: botReply });
}
