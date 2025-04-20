import { Schema, model, models } from "mongoose";

const ChatSchema = new Schema({
  userId: { type: String, required: true },
  title: String,
  createdAt: { type: Date, default: Date.now },
});

const Chat = models.Chat || model("Chat", ChatSchema);
export default Chat;
