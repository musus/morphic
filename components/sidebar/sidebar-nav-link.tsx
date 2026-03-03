'use client'

import { ReactNode, useCallback } from 'react'
import Link from 'next/link'

import { useSidebar } from '@/components/ui/sidebar'

interface SidebarNavLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function SidebarNavLink({
  href,
  children,
  className
}: SidebarNavLinkProps) {
  const { setOpenMobile } = useSidebar()
  const handleClick = useCallback(() => {
    setOpenMobile(false)
  }, [setOpenMobile])

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
