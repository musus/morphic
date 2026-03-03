'use client'

import { cn } from '@/lib/utils'

export function AnimatedLogo({
  className,
  ...props
}: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 256 256"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-8 w-8 animate-pulse', className)}
      {...props}
    >
      <text
        x="128"
        y="218"
        textAnchor="middle"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontWeight="700"
        fontSize="300"
        fill="currentColor"
      >
        t
      </text>
    </svg>
  )
}
