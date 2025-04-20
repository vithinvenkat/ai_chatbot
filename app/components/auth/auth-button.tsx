import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '../ui/button'
import { ReactNode } from 'react'

interface AuthButtonProps {
  mode: 'sign-in' | 'sign-up'
  children: ReactNode
  className?: string
}

export function AuthButton({ mode, children, className = '' }: AuthButtonProps) {
  const ButtonWrapper = mode === 'sign-in' ? SignInButton : SignUpButton
  const variant = mode === 'sign-in' ? 'default' : 'outline'

  return (
    <ButtonWrapper mode="modal">
      <Button 
        variant={variant} 
        className={`w-full ${className}`}
        size="lg"
      >
        {children}
      </Button>
    </ButtonWrapper>
  )
} 