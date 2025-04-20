import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createuser } from "../../../../lib/actions/user.actions";
import { connect } from "../../../../lib/db";
import User from "../../../../lib/modals/user.modal"

export async function POST(req:Request){
    try {
      const body = await req.json();
      const eventType = body.type;
      const userData = body.data;
  
      await connect();
  
      if (eventType === "user.created" || eventType === "user.updated") {
        const user = {
          clerkId: userData.id,
          email: userData.email_addresses[0]?.email_address,
          username: userData.username || "",
          photo: userData.image_url,
          firstName: userData.first_name,
          lastName: userData.last_name,
        };
  
        await User.findOneAndUpdate(
          { clerkId: user.clerkId },
          user,
          { upsert: true, new: true }
        );
      }
  
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("Webhook error:", err);
      return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
    }
  }