import { useCallback, useEffect, useState } from 'react'
import {
  PageTransition,
  type TransitionDirection,
  type TransitionMode,
} from './components/PageTransition'
import { PageWipeOverlay } from './components/PageWipeOverlay'
import { Page1Intro } from './pages/Page1Intro'
import { Page2Dialogue } from './pages/Page2Dialogue'
import { Page4Intro } from './pages/Page4Intro'
import { Page5JamesDialogue } from './pages/Page5JamesDialogue'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { getDevInitialPage } from './config/devPreview'
import { clearDialogueExitSnapshot } from './utils/dialogueExitSnapshot'
import { resetDialoguePopupSession } from './utils/dialoguePopupSession'
import { PAGE_ORDER, type PageId } from './types/pages'
import {
  playIntroVoice,
  resetScorePageIntroVoice,
  stopIntroVoice,
  unlockPageAudioFromGesture,
} from './utils/pageAudio'

const JAMES_INTRO_PRELOAD = [
  '/assets/background-james.png',
  '/assets/character-name-james.png',
  '/assets/character-picture-james.png',
  '/assets/button-go.png',
] as const

const JAMES_DIALOGUE_PRELOAD = [
  '/assets/background-dialogue-james.png',
  '/assets/character-james.png',
  '/assets/button-replay.png',
  '/assets/button-microphone.png',
  '/james.mp3',
  '/james2.mp3',
] as const

const INTRO_PRELOAD = ['/intro.mp3', '/open.mp3', '/open2.mp3'] as const

const DIALOGUE_PRELOAD = [
  '/assets/background-dialogue-olivia.png',
  '/assets/character-olivia.png',
  '/assets/button-replay.png',
  '/assets/hint-bulb.png',
  '/assets/hint-01.png',
  '/assets/hint-02.png',
  '/assets/button-microphone.png',
  '/olivia.mp3',
  '/olivia2.mp3',
  '/button.mp3',
  '/assets/score-good.png',
  '/assets/score-ribbon.png',
  '/assets/score-star.png',
  '/assets/button-next.png',
  '/popup.mp3',
  '/fb2.mp3',
] as const

const JAMES_POPUP_PRELOAD = [
  '/assets/score-background.png',
  '/assets/score-confetti.png',
  '/assets/score-super.png',
  '/assets/score-ribbon.png',
  '/assets/score-star.png',
  '/popup2.mp3',
  '/fb1.mp3',
] as const

function App() {
  const [page, setPage] = useState<PageId>(() => {
    const initial = getDevInitialPage() ?? 'intro'
    if (initial === 'dialogue') {
      resetDialoguePopupSession('olivia')
    }
    if (initial === 'hint') {
      resetDialoguePopupSession('james')
    }
    return initial
  })
  const [exitingPage, setExitingPage] = useState<PageId | null>(null)
  const [direction, setDirection] = useState<TransitionDirection | null>(null)
  const [mode, setMode] = useState<TransitionMode | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scoreWipeActive, setScoreWipeActive] = useState(false)

  useEffect(() => {
    ;[
      ...INTRO_PRELOAD,
      ...DIALOGUE_PRELOAD,
      ...JAMES_INTRO_PRELOAD,
      ...JAMES_DIALOGUE_PRELOAD,
      ...JAMES_POPUP_PRELOAD,
    ].forEach((src) => {
      if (/\.(mp3|wav|ogg|m4a)$/i.test(src)) {
        const audio = new Audio(src)
        audio.preload = 'auto'
        audio.load()
        return
      }
      const img = new Image()
      img.src = src
    })
  }, [])

  useEffect(() => {
    if (page === 'intro') {
      playIntroVoice()
      return
    }
    if (page !== 'score') {
      stopIntroVoice()
    }
  }, [page])

  useEffect(() => {
    const unlock = () => unlockPageAudioFromGesture()
    document.addEventListener('pointerdown', unlock, { once: true, capture: true })
    document.addEventListener('touchstart', unlock, { once: true, capture: true })
    return () => {
      document.removeEventListener('pointerdown', unlock, { capture: true })
      document.removeEventListener('touchstart', unlock, { capture: true })
    }
  }, [])

  const clearTransition = useCallback(() => {
    setExitingPage(null)
    setDirection(null)
    setMode(null)
    setIsTransitioning(false)
    clearDialogueExitSnapshot()
    resetDialoguePopupSession()
  }, [])

  const dialogueOnScreen = page === 'dialogue' || exitingPage === 'dialogue'
  const jamesDialogueOnScreen = page === 'hint' || exitingPage === 'hint'

  const getTransitionMode = (
    from: PageId,
    to: PageId,
    dir: TransitionDirection,
  ): TransitionMode => {
    if (dir === 'forward' && from === 'intro' && to === 'dialogue') {
      return 'circle'
    }
    if (dir === 'forward' && from === 'score' && to === 'hint') {
      return 'circle'
    }
    return 'slide'
  }

  const navigate = useCallback(
    (next: PageId, dir: TransitionDirection) => {
      if (isTransitioning || next === page) return
      if (next === 'dialogue') {
        resetDialoguePopupSession('olivia')
      }
      if (next === 'hint') {
        resetDialoguePopupSession('james')
      }
      const transitionMode = getTransitionMode(page, next, dir)

      setIsTransitioning(true)
      setDirection(dir)
      setMode(transitionMode)
      setExitingPage(page)
      setPage(next)
    },
    [isTransitioning, page],
  )

  const goNext = useCallback(() => {
    const index = PAGE_ORDER.indexOf(page)
    if (index < PAGE_ORDER.length - 1) {
      navigate(PAGE_ORDER[index + 1], 'forward')
    }
  }, [navigate, page])

  const beginScoreWipe = useCallback(() => {
    if (isTransitioning || scoreWipeActive || page !== 'dialogue') return
    resetScorePageIntroVoice()
    setIsTransitioning(true)
    setScoreWipeActive(true)
  }, [isTransitioning, page, scoreWipeActive])

  const finishScoreWipe = useCallback(() => {
    setScoreWipeActive(false)
    setPage('score')
    setIsTransitioning(false)
    clearDialogueExitSnapshot()
    resetDialoguePopupSession()
  }, [])

  const goBack = useCallback(() => {
    const index = PAGE_ORDER.indexOf(page)
    if (index > 0) {
      navigate(PAGE_ORDER[index - 1], 'back')
    }
  }, [navigate, page])

  const handleClose = () => {
    window.alert('학습을 종료할까요?')
  }

  const renderPage = (id: PageId) => {
    switch (id) {
      case 'intro':
        return (
          <Page1Intro
            onStart={goNext}
            onClose={handleClose}
            isTransitioning={isTransitioning}
          />
        )
      case 'dialogue':
        return (
          <Page2Dialogue
            onClose={handleClose}
            onNext={beginScoreWipe}
            active={dialogueOnScreen}
            transitionComplete={dialogueOnScreen && !isTransitioning}
          />
        )
      case 'score':
        return (
          <Page4Intro
            onGo={goNext}
            onClose={handleClose}
            isTransitioning={isTransitioning}
          />
        )
      case 'hint':
        return (
          <Page5JamesDialogue
            onClose={handleClose}
            onNext={goNext}
            active={jamesDialogueOnScreen}
            transitionComplete={jamesDialogueOnScreen && !isTransitioning}
          />
        )
      default:
        return <PlaceholderPage pageId={id} onBack={goBack} />
    }
  }

  return (
    <>
      <PageTransition
        page={page}
        exitingPage={exitingPage}
        direction={direction}
        mode={mode}
        exitingChildren={exitingPage ? renderPage(exitingPage) : null}
        onTransitionEnd={clearTransition}
      >
        {renderPage(page)}
      </PageTransition>

      {scoreWipeActive && (
        <PageWipeOverlay onComplete={finishScoreWipe}>
          <Page4Intro
            embedded
            onGo={goNext}
            onClose={handleClose}
            isTransitioning={isTransitioning}
          />
        </PageWipeOverlay>
      )}
    </>
  )
}

export default App
