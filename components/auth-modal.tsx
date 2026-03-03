'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center">
            <span
              className="text-2xl tracking-tight"
              style={{
                fontFamily:
                  "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 700
              }}
            >
              techless
            </span>
          </div>
          <DialogTitle className="text-xl font-semibold">
            Continue with techless
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            To use techless, sign in to your account or create a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
