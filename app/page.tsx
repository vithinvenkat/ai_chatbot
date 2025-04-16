import { SignedIn, SignedOut } from '@clerk/nextjs';
import { AuthContainer } from '@/components/auth/auth-container';
import Link from 'next/link';
import { Button } from '../components/ui/button';

export default function Home() {
  return (
    <>
      <SignedIn>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Welcome to AI Chatbot</h1>
          <p className="text-muted-foreground mb-6">Start chatting with our AI assistant!</p>
          <Link href="/chat">
            <Button size="lg">
              Start Chatting
            </Button>
          </Link>
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
