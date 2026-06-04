import { useCallback, useEffect, useRef, type AnimationEvent, type ReactNode } from 'react'
import { PAGE_TRANSITION_COVER_MS } from './PageTransition'

type PageWipeOverlayProps = {
  children: ReactNode
  onComplete: () => void
}

export function PageWipeOverlay({ children, onComplete }: PageWipeOverlayProps) {
  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    onComplete()
  }, [onComplete])

  useEffect(() => {
    finishedRef.current = false
    const timer = window.setTimeout(finish, PAGE_TRANSITION_COVER_MS)
    return () => window.clearTimeout(timer)
  }, [finish])

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (
      event.animationName === 'page-reveal-wipe-right' ||
      event.animationName === 'page-fade-in'
    ) {
      finish()
    }
  }

  return (
    <div className="page-wipe-overlay" aria-hidden={false}>
      <div
        className="page-wipe-overlay__layer page-transition__layer page-transition__layer--enter-cover-right"
        onAnimationEnd={handleAnimationEnd}
      >
        {children}
      </div>
    </div>
  )
}
