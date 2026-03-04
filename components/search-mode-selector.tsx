'use client'

import { useEffect, useRef, useState } from 'react'

import { Check, ChevronDown } from 'lucide-react'

import {
  getSearchModeLimitation,
  SEARCH_MODE_CONFIGS
} from '@/lib/config/search-modes'
import { SearchMode } from '@/lib/types/search'
import { cn } from '@/lib/utils'
import { getCookie, setCookie } from '@/lib/utils/cookies'

import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'

interface SearchModeSelectorProps {
  selectedProviderId?: string | null
}

export function SearchModeSelector({
  selectedProviderId = null
}: SearchModeSelectorProps) {
  const [value, setValue] = useState<SearchMode>('search')
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({})
  const [openHoverCard, setOpenHoverCard] = useState<string | null>(null)
  const [justSelected, setJustSelected] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const savedMode = getCookie('searchMode')
    if (savedMode && ['chat', 'search', 'research'].includes(savedMode)) {
      setValue(savedMode as SearchMode)
    } else if (savedMode) {
      // Clean up invalid cookie value (e.g., old 'quick', 'adaptive', 'direct', 'planning' modes)
      setCookie('searchMode', 'search')
      setValue('search')
    }
  }, [])

  useEffect(() => {
    // Update indicator position when value changes
    const selectedIndex = SEARCH_MODE_CONFIGS.findIndex(
      config => config.value === value
    )
    const selectedButton = buttonsRef.current[selectedIndex]

    if (selectedButton) {
      const { offsetLeft, offsetWidth } = selectedButton
      setIndicatorStyle({
        transform: `translateX(${offsetLeft}px)`,
        width: `${offsetWidth}px`
      })
    }
  }, [value])

  const handleModeSelect = (mode: SearchMode) => {
    setValue(mode)
    setCookie('searchMode', mode)
    setOpenHoverCard(null) // Close hover card on selection
    setDropdownOpen(false) // Close dropdown on selection
    setJustSelected(true)

    // Prevent hover card from reopening immediately
    setTimeout(() => {
      setJustSelected(false)
    }, 500)
  }

  // Auto-fallback when current mode becomes disabled due to model change
  useEffect(() => {
    const limitation = getSearchModeLimitation(selectedProviderId, value)
    if (limitation.disabled) {
      // Fall back to first available mode
      const fallback = SEARCH_MODE_CONFIGS.find(
        c => !getSearchModeLimitation(selectedProviderId, c.value).disabled
      )
      if (fallback) handleModeSelect(fallback.value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProviderId])

  const selectedMode = SEARCH_MODE_CONFIGS.find(
    config => config.value === value
  )
  const SelectedIcon = selectedMode?.icon
  const selectedLimitation = getSearchModeLimitation(selectedProviderId, value)

  return (
    <>
      {/* Mobile Dropdown */}
      <div className="sm:hidden">
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="text-sm rounded-full shadow-none gap-1 transition-all"
            >
              {SelectedIcon && (
                <SelectedIcon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    selectedMode?.color
                  )}
                />
              )}
              <span className="text-xs font-medium">
                {selectedMode?.label}
              </span>
              <ChevronDown
                className={cn(
                  'h-3 w-3 ml-1 opacity-50 transition-transform duration-200',
                  dropdownOpen && 'rotate-180'
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64" sideOffset={5}>
            {SEARCH_MODE_CONFIGS.map(config => {
              const ModeIcon = config.icon
              const isSelected = value === config.value
              const limitation = getSearchModeLimitation(
                selectedProviderId,
                config.value
              )
              return (
                <DropdownMenuItem
                  key={config.value}
                  onClick={() =>
                    !limitation.disabled && handleModeSelect(config.value)
                  }
                  disabled={limitation.disabled}
                  className={cn(
                    'relative flex flex-col items-start gap-1 py-2 pl-8 pr-2 focus:outline-none',
                    limitation.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-pointer'
                  )}
                >
                  {isSelected && (
                    <Check className="absolute left-2 top-2.5 h-4 w-4" />
                  )}
                  <div className="flex items-center gap-2">
                    <ModeIcon
                      className={cn('h-4 w-4 transition-colors', config.color)}
                    />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 ml-6">
                    <span className="text-xs text-muted-foreground">
                      {config.description}
                    </span>
                    {limitation.disabled && limitation.message && (
                      <span className="text-xs text-amber-500">
                        {limitation.message}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Toggle */}
      <div className="hidden sm:block">
        <div className="relative inline-flex items-center rounded-full bg-background border p-1">
          {/* Animated background indicator */}
          <div
            className="absolute inset-y-1 rounded-full bg-muted transition-all duration-200 ease-out"
            style={indicatorStyle}
          />

          {/* Mode buttons */}
          <div className="relative flex items-center">
            {SEARCH_MODE_CONFIGS.map((config, index) => {
              const Icon = config.icon
              const isSelected = value === config.value
              const limitation = getSearchModeLimitation(
                selectedProviderId,
                config.value
              )

              return (
                <HoverCard
                  key={config.value}
                  open={!justSelected && openHoverCard === config.value}
                  onOpenChange={open => {
                    if (!justSelected) {
                      setOpenHoverCard(open ? config.value : null)
                    }
                  }}
                  openDelay={100}
                  closeDelay={50}
                >
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      ref={el => {
                        buttonsRef.current[index] = el
                      }}
                      onClick={() =>
                        !limitation.disabled && handleModeSelect(config.value)
                      }
                      disabled={limitation.disabled}
                      className={cn(
                        'relative z-10 flex items-center justify-center rounded-full px-3 py-2 transition-colors duration-200',
                        limitation.disabled
                          ? 'opacity-30 cursor-not-allowed'
                          : isSelected
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground/80'
                      )}
                      aria-label={`${config.label} mode`}
                      aria-pressed={isSelected}
                      aria-disabled={limitation.disabled}
                    >
                      <Icon
                        className={cn(
                          'h-3.5 w-3.5 transition-colors',
                          isSelected ? config.color : ''
                        )}
                      />
                    </button>
                  </HoverCardTrigger>

                  <HoverCardContent
                    className="w-72"
                    align="center"
                    sideOffset={8}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('h-5 w-5', config.color)} />
                        <h4 className="text-sm font-semibold">
                          {config.label}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {config.description}
                      </p>
                      {limitation.disabled && limitation.message && (
                        <p className="text-xs text-amber-500 leading-tight">
                          {limitation.message}
                        </p>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
