import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { AuthContainer } from '@/components/auth/auth-container';

export default function Home() {
  return (
    <>
      <SignedIn>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Welcome to AI Chatbot</h1>
          <p className="text-muted-foreground mb-6">Your chat interface is coming soon!</p>
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
      
      <SignedOut>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <AuthContainer />
        </div>
      </SignedOut>
    </>
  );
}
