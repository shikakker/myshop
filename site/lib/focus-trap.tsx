import React, { useEffect, RefObject } from 'react'
import { tabbable } from 'tabbable'

interface Props {
  children: React.ReactNode
  focusFirst?: boolean
}

export default function FocusTrap({ children, focusFirst = false }: Props) {
  const root: RefObject<HTMLDivElement> = React.useRef(null)
  const anchor = React.useRef<Element | null>(
    typeof document === 'undefined' ? null : document.activeElement
  )

  useEffect(() => {
    const returnFocusTarget = anchor.current
    let focusableTimer: ReturnType<typeof setInterval> | undefined

    const selectFirstFocusableEl = () => {
      let attempts = 0
      focusableTimer = setInterval(() => {
        const container = root.current
        if (!container) return

        const focusable = tabbable(container)
        if (focusable.length > 0) {
          focusable[0].focus()
          if (focusableTimer) clearInterval(focusableTimer)
          return
        }

        attempts += 1
        if (attempts >= 60 && focusableTimer) {
          clearInterval(focusableTimer)
        }
      }, 100)
    }

    const focusTimer = setTimeout(() => {
      root.current?.focus()
      if (focusFirst) selectFirstFocusableEl()
    }, 20)

    return () => {
      clearTimeout(focusTimer)
      if (focusableTimer) clearInterval(focusableTimer)
      if (returnFocusTarget instanceof HTMLElement) {
        returnFocusTarget.focus()
      }
    }
  }, [focusFirst])

  return (
    <div ref={root} className="outline-none focus-trap" tabIndex={-1}>
      {children}
    </div>
  )
}
