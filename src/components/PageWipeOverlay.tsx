import { useCallback, useEffect, useRef, type AnimationEvent, type ReactNode } from 'react'
import { PAGE_TRANSITION_COVER_MS, PAGE_TRANSITION_PUSH_LEFT_MS } from './PageTransition'

export type WipeTransitionMode = 'cover-right' | 'push-left'

type PageWipeOverlayProps = {
  children: ReactNode
  onComplete: () => void
  mode?: WipeTransitionMode
}

export function PageWipeOverlay({
  children,
  onComplete,
  mode = 'cover-right',
}: PageWipeOverlayProps) {
  const finishedRef = useRef(false)
  const durationMs =
    mode === 'push-left'
      ? PAGE_TRANSITION_PUSH_LEFT_MS
      : PAGE_TRANSITION_COVER_MS

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    onComplete()
  }, [onComplete])

  useEffect(() => {
    finishedRef.current = false
    const timer = window.setTimeout(finish, durationMs)
    return () => window.clearTimeout(timer)
  }, [durationMs, finish])

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (
      event.animationName === 'page-reveal-wipe-right' ||
      event.animationName === 'page-enter-push-left' ||
      event.animationName === 'page-fade-in'
    ) {
      finish()
    }
  }

  const layerClass =
    mode === 'push-left'
      ? 'page-wipe-overlay__layer page-transition__layer page-wipe-overlay__layer--enter-push-left'
      : 'page-wipe-overlay__layer page-transition__layer page-transition__layer--enter-cover-right'

  return (
    <div
      className={`page-wipe-overlay${mode === 'push-left' ? ' page-wipe-overlay--push-left' : ''}`}
      aria-hidden={false}
    >
      <div className={layerClass} onAnimationEnd={handleAnimationEnd}>
        {children}
      </div>
    </div>
  )
}
