'use client'

import { useCallback, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { MoreHorizontal, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { clearChats } from '@/lib/actions/chat'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarGroupAction, useSidebar } from '@/components/ui/sidebar'
import { Spinner } from '@/components/ui/spinner'

interface ClearHistoryActionProps {
  empty: boolean
}

export function ClearHistoryAction({ empty }: ClearHistoryActionProps) {
  const [isPending, startTransition] = useTransition()
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const router = useRouter()
  const { setOpenMobile } = useSidebar()

  const handleClearAction = useCallback(() => {
    startTransition(async () => {
      const res = await clearChats()
      if (res?.success) {
        toast.success('履歴を削除しました')
        setOpenMobile(false)
        router.push('/')
      } else if (res?.error) {
        toast.error(res.error)
      }
      setShowDeleteAlert(false)
      window.dispatchEvent(new CustomEvent('chat-history-updated'))
    })
  }, [startTransition, router, setOpenMobile])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarGroupAction disabled={empty} className="static size-7 p-1">
            <MoreHorizontal size={16} />
            <span className="sr-only">履歴の操作</span>
          </SidebarGroupAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={empty || isPending}
            className="gap-2 text-destructive focus:text-destructive"
            onSelect={() => setShowDeleteAlert(true)}
          >
            <Trash2 size={14} /> 履歴を削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。すべての履歴が完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={event => {
                event.preventDefault()
                handleClearAction()
              }}
            >
              {isPending ? <Spinner /> : '削除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
