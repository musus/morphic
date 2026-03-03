'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

function IconLogo({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 256 256"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <circle cx="128" cy="128" r="128" fill="black"></circle>
      <circle cx="102" cy="128" r="18" fill="white"></circle>
      <circle cx="154" cy="128" r="18" fill="white"></circle>
    </svg>
  )
}

function IconLogoOutline({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 256 256"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <circle
        cx="128"
        cy="128"
        r="108"
        fill="none"
        stroke="currentColor"
        strokeWidth="24"
      ></circle>
      <circle cx="102" cy="128" r="18" fill="currentColor"></circle>
      <circle cx="154" cy="128" r="18" fill="currentColor"></circle>
    </svg>
  )
}

function IconBlinkingLogo({
  className,
  ...props
}: React.ComponentProps<'svg'>) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const blinkElements = document.querySelectorAll('.blink')
    const initialPositions = Array.from(blinkElements).map(el => ({
      cx: parseFloat(el.getAttribute('cx') || '0'),
      cy: parseFloat(el.getAttribute('cy') || '0')
    }))

    const triggerBlink = () => {
      blinkElements.forEach(el => {
        el.classList.add('animate-blink')
        setTimeout(() => {
          el.classList.remove('animate-blink')
        }, 200)
      })
    }

    const randomInterval = () => Math.random() * 8000 + 2000

    let timeoutId: ReturnType<typeof setTimeout>
    const startBlinking = () => {
      triggerBlink()
      timeoutId = setTimeout(startBlinking, randomInterval())
    }

    startBlinking()

    const handleMove = (clientX: number, clientY: number) => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        const mouseX = clientX - rect.left - rect.width / 2 - 256
        const mouseY = clientY - rect.top - rect.height / 2

        const maxMove = 60

        blinkElements.forEach((el, index) => {
          const { cx, cy } = initialPositions[index]
          const targetDx = Math.min((mouseX - cx) * 0.1, maxMove)
          const targetDy = Math.min((mouseY - cy) * 0.1, maxMove)

          let velocityX = 0
          let velocityY = 0
          const damping = 0.05

          const animate = () => {
            const currentCx = parseFloat(el.getAttribute('cx') || '0')
            const currentCy = parseFloat(el.getAttribute('cy') || '0')

            const dx = (targetDx - (currentCx - cx)) * 0.1
            const dy = (targetDy - (currentCy - cy)) * 0.1

            velocityX = velocityX * damping + dx
            velocityY = velocityY * damping + dy

            el.setAttribute('cx', (currentCx + velocityX).toString())
            el.setAttribute('cy', (currentCy + velocityY).toString())

            if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        })
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      handleMove(event.clientX, event.clientY)
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        handleMove(event.touches[0].clientX, event.touches[0].clientY)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      fill="currentColor"
      viewBox="0 0 256 256"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <circle cx="128" cy="128" r="128" fill="#222"></circle>
      <ellipse
        cx="102"
        cy="128"
        rx="18"
        ry="18"
        fill="white"
        className="blink"
      ></ellipse>
      <ellipse
        cx="154"
        cy="128"
        rx="18"
        ry="18"
        fill="white"
        className="blink"
      ></ellipse>
    </svg>
  )
}

function IconOpenAI({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  )
}

function IconAnthropic({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <path d="M17.304 3.541h-3.672l6.696 16.918h3.672zm-10.608 0L0 20.459h3.744l1.37-3.553h7.005l1.369 3.553h3.744L10.536 3.541zm-.372 10.339l2.673-6.927 2.672 6.927z" />
    </svg>
  )
}

function IconGoogle({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.8 4.133-1.147 1.147-2.933 2.4-6.04 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053z" />
    </svg>
  )
}

export {
  IconAnthropic,
  IconBlinkingLogo,
  IconGoogle,
  IconLogo,
  IconLogoOutline,
  IconOpenAI
}
