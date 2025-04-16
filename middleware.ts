import { clerkMiddleware } from "@clerk/nextjs/server";

// Export Clerk's middleware directly
export default clerkMiddleware();

// Only run middleware on matched routes
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};