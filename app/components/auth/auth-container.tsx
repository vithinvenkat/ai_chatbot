import { AuthButton } from './auth-button'
import { Separator } from '../ui/separator'

export function AuthContainer() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to AI Chatbot
        </h1>
        <p className="text-muted-foreground">
          Sign in to start chatting with our AI
        </p>
      </div>
      
      <div className="space-y-4">
        <AuthButton mode="sign-in">
          Sign in
        </AuthButton>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <AuthButton mode="sign-up">
          Create an account
        </AuthButton>
      </div>
    </div>
  )
} 