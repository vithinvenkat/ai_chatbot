import { Schema, model, models } from "mongoose";

const MessageSchema = new Schema({
  chatId: { 
    type: String, 
    required: true,
    index: true
  },
  userId: { 
    type: String, 
    required: false // Optional for assistant messages
  },
  role: { 
    type: String, 
    required: true,
    enum: ["user", "assistant", "system"],
    default: "user"
  },
  content: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create indexes for faster queries
MessageSchema.index({ chatId: 1, createdAt: 1 });

const Message = models.Message || model("Message", MessageSchema);
export default Message;
