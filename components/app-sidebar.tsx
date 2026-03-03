import { Suspense } from 'react'

import { FileText, Plus } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar'

import { ChatHistorySection } from './sidebar/chat-history-section'
import { ChatHistorySkeleton } from './sidebar/chat-history-skeleton'
import { SidebarNavLink } from './sidebar/sidebar-nav-link'

export default function AppSidebar({ hasUser = false }: { hasUser?: boolean }) {
  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="flex flex-row justify-between items-center">
        <SidebarNavLink href="/" className="flex items-center px-2 py-3">
          <span
            className="text-sm tracking-tight"
            style={{
              fontFamily:
                "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 700
            }}
          >
            techless
          </span>
        </SidebarNavLink>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent className="flex flex-col px-2 py-4 h-full">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <SidebarNavLink href="/" className="flex items-center gap-2">
                <Plus className="size-4" />
                <span>新規</span>
              </SidebarNavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <SidebarNavLink
                href="/prompts"
                className="flex items-center gap-2"
              >
                <FileText className="size-4" />
                <span>プロンプト</span>
              </SidebarNavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {hasUser && (
          <div className="flex-1 overflow-y-auto">
            <Suspense fallback={<ChatHistorySkeleton />}>
              <ChatHistorySection />
            </Suspense>
          </div>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
