'use client'

import Link from 'next/link'

import { AlertCircle, Clock, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface ErrorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  error: {
    type: 'rate-limit' | 'auth' | 'forbidden' | 'general'
    message: string
    details?: string
  }
  onRetry?: () => void
  onAuthClose?: () => void
}

export function ErrorModal({
  open,
  onOpenChange,
  error,
  onRetry,
  onAuthClose
}: ErrorModalProps) {
  const handleAuthClose = () => {
    onOpenChange(false)
    onAuthClose?.()
  }

  const getErrorIcon = () => {
    switch (error.type) {
      case 'rate-limit':
        return <Clock className="size-6 text-yellow-500" />
      case 'auth':
      case 'forbidden':
        return <AlertCircle className="size-6 text-red-500" />
      default:
        return <AlertCircle className="size-6 text-orange-500" />
    }
  }

  const getErrorTitle = () => {
    switch (error.type) {
      case 'rate-limit':
        return 'リクエスト制限に達しました'
      case 'auth':
        return 'Morphicを続ける'
      case 'forbidden':
        return 'アクセスが拒否されました'
      default:
        return 'エラーが発生しました'
    }
  }

  const getErrorDescription = () => {
    switch (error.type) {
      case 'rate-limit':
        return (
          error.message ||
          'リクエストが多すぎます。しばらくしてからもう一度お試しください。'
        )
      case 'auth':
        return 'Morphicを利用するには、アカウントにログインするか新規登録してください。'
      case 'forbidden':
        return 'このリソースへのアクセス権限がありません。'
      default:
        return (
          error.message || '予期しないエラーが発生しました。もう一度お試しください。'
        )
    }
  }

  const getErrorDetails = () => {
    if (error.type === 'rate-limit') {
      return '制限はUTC午前0時にリセットされます。スピードモードは引き続き制限なくご利用いただけます。'
    }
    return error.details
  }

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (!open && error.type === 'auth') {
          handleAuthClose()
        } else {
          onOpenChange(open)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            {getErrorIcon()}
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            {getErrorTitle()}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {getErrorDescription()}
          </DialogDescription>
          {getErrorDetails() && (
            <div className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              {getErrorDetails()}
            </div>
          )}
        </DialogHeader>
        <DialogFooter className="flex-col gap-2">
          {error.type === 'auth' ? (
            <>
              <Button asChild className="w-full">
                <Link href="/auth/sign-up">新規登録</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">ログイン</Link>
              </Button>
            </>
          ) : (
            <>
              {onRetry && error.type !== 'rate-limit' && (
                <Button
                  onClick={() => {
                    onRetry()
                    onOpenChange(false)
                  }}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 size-4" />
                  再試行
                </Button>
              )}
              <Button
                variant={
                  onRetry && error.type !== 'rate-limit' ? 'outline' : 'default'
                }
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                {error.type === 'rate-limit' ? '了解' : '閉じる'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
