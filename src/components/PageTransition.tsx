import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type ReactNode,
} from 'react'
import type { PageId } from '../types/pages'

export const PAGE_TRANSITION_MS = 420
export const PAGE_TRANSITION_CIRCLE_MS = 2100
/** 제임스 인트로 → 대화 원형 전환 */
export const PAGE_TRANSITION_CIRCLE_JAMES_MS = 1300
export const PAGE_TRANSITION_COVER_MS = 2100

export type TransitionDirection = 'forward' | 'back'
export type TransitionMode = 'slide' | 'circle' | 'cover-right'

const CIRCLE_LANDING_PAGES: PageId[] = ['dialogue', 'hint']

type PageTransitionProps = {
  page: PageId
  exitingPage: PageId | null
  direction: TransitionDirection | null
  mode: TransitionMode | null
  children: ReactNode
  exitingChildren: ReactNode | null
  onTransitionEnd?: () => void
}

export function PageTransition({
  page,
  exitingPage,
  direction,
  mode,
  children,
  exitingChildren,
  onTransitionEnd,
}: PageTransitionProps) {
  const [showExit, setShowExit] = useState(Boolean(exitingPage))
  const [circleRevealed, setCircleRevealed] = useState(false)
  const finishedRef = useRef(false)
  const isJamesCircle =
    mode === 'circle' && exitingPage === 'score' && page === 'hint'

  const durationMs = isJamesCircle
    ? PAGE_TRANSITION_CIRCLE_JAMES_MS
    : mode === 'circle' || mode === 'cover-right'
      ? PAGE_TRANSITION_COVER_MS
      : PAGE_TRANSITION_MS

  const finishTransition = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    if (mode === 'circle') setCircleRevealed(true)
    setShowExit(false)
    onTransitionEnd?.()
  }, [mode, onTransitionEnd])

  useEffect(() => {
    if (exitingPage) {
      finishedRef.current = false
      setShowExit(true)
      if (mode === 'circle') setCircleRevealed(false)
      return
    }
    setShowExit(false)
  }, [exitingPage, mode])

  useEffect(() => {
    if (!CIRCLE_LANDING_PAGES.includes(page)) setCircleRevealed(false)
  }, [page])

  useEffect(() => {
    if (!exitingPage) return
    const timer = window.setTimeout(finishTransition, durationMs)
    return () => window.clearTimeout(timer)
  }, [durationMs, exitingPage, finishTransition])

  const handleEnterAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !exitingPage) return
    const name = event.animationName
    const isCircleDone =
      mode === 'circle' &&
      (name === 'page-reveal-circle' || name === 'page-fade-in')
    const isSlideDone =
      mode === 'slide' &&
      (name.includes('page-enter-forward') || name.includes('page-enter-back'))
    const isCoverRightDone =
      mode === 'cover-right' &&
      (name === 'page-reveal-wipe-right' || name === 'page-fade-in')
    if (!isCircleDone && !isSlideDone && !isCoverRightDone) return

    finishTransition()
  }

  let exitClass = 'page-transition__layer--exit-forward'
  let enterClass = 'page-transition__layer--enter-forward'

  if (circleRevealed && CIRCLE_LANDING_PAGES.includes(page)) {
    enterClass = 'page-transition__layer--enter-circle-complete'
  } else if (mode === 'circle') {
    exitClass = 'page-transition__layer--exit-under-circle'
    enterClass = isJamesCircle
      ? 'page-transition__layer--enter-circle page-transition__layer--enter-circle--fast'
      : 'page-transition__layer--enter-circle'
  } else if (mode === 'cover-right') {
    exitClass = 'page-transition__layer--exit-under-cover'
    enterClass = 'page-transition__layer--enter-cover-right'
  } else if (direction === 'back') {
    exitClass = 'page-transition__layer--exit-back'
    enterClass = 'page-transition__layer--enter-back'
  }

  return (
    <div className="page-transition" aria-live="polite">
      {showExit && exitingPage && exitingChildren && direction && (
        <div
          key={`exit-${exitingPage}`}
          className={`page-transition__layer ${exitClass}`}
          aria-hidden
        >
          {exitingChildren}
        </div>
      )}
      <div
        key={`enter-${page}`}
        className={`page-transition__layer ${direction || circleRevealed ? enterClass : ''}`}
        onAnimationEnd={handleEnterAnimationEnd}
      >
        {children}
      </div>
    </div>
  )
}
