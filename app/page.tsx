"use client"

import { SignedIn, SignedOut } from '@clerk/nextjs';
import { AuthContainer } from './components/auth/auth-container';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  // Using a component to handle redirect properly
  function RedirectToChat() {
    useEffect(() => {
      redirect('/chat')
    }, [])
    return null
  }

  return (
    <>
      <SignedIn>
        <RedirectToChat />
      </SignedIn>
      
      <SignedOut>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md w-full">
            <AuthContainer />
          </div>
        </div>
      </SignedOut>
    </>
  );
}
