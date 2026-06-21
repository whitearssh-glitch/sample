import { useCallback, useEffect, useState } from 'react'
import {
  PageTransition,
  PAGE_TRANSITION_PUSH_LEFT_MS,
  type TransitionDirection,
  type TransitionMode,
} from './components/PageTransition'
import { PageWipeOverlay } from './components/PageWipeOverlay'
import { PageMain } from './pages/PageMain'
import { Page1Intro } from './pages/Page1Intro'
import { Page1IntroV2 } from './pages/Page1IntroV2'
import { Page2Dialogue } from './pages/Page2Dialogue'
import { Page2DialogueV2 } from './pages/Page2DialogueV2'
import { Page4Intro } from './pages/Page4Intro'
import { Page4IntroV2 } from './pages/Page4IntroV2'
import { Page5JamesDialogue } from './pages/Page5JamesDialogue'
import { Page5JamesDialogueV2 } from './pages/Page5JamesDialogueV2'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { getDevInitialPage } from './config/devPreview'
import {
  EMMA_DIALOGUE_VOICE,
  JAMES_DIALOGUE_VOICE,
  LEO_DIALOGUE_VOICE,
  OLIVIA_DIALOGUE_VOICE,
} from './config/dialogueVoice'
import { clearDialogueExitSnapshot } from './utils/dialogueExitSnapshot'
import { resetDialoguePopupSession } from './utils/dialoguePopupSession'
import {
  getFlowOrder,
  trackForPage,
  type PageId,
} from './types/pages'
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
  JAMES_DIALOGUE_VOICE.voiceSrc,
  JAMES_DIALOGUE_VOICE.responseVoiceSrc,
] as const

const V2 = '/assets/ver2/sources'

const DIALOGUE_V2_PRELOAD = [
  `${V2}/button-replay.png`,
  `${V2}/button-microphone.png`,
  EMMA_DIALOGUE_VOICE.voiceSrc,
  EMMA_DIALOGUE_VOICE.responseVoiceSrc,
] as const

const LEO_DIALOGUE_PRELOAD = [
  `${V2}/button-replay.png`,
  `${V2}/button-microphone.png`,
  LEO_DIALOGUE_VOICE.voiceSrc,
  LEO_DIALOGUE_VOICE.responseVoiceSrc,
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
  OLIVIA_DIALOGUE_VOICE.voiceSrc,
  OLIVIA_DIALOGUE_VOICE.responseVoiceSrc,
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

type ScoreWipeTarget = 'score' | 'score-v2'

function App() {
  const [page, setPage] = useState<PageId>(() => {
    const initial = getDevInitialPage() ?? 'main'
    if (initial === 'dialogue') {
      resetDialoguePopupSession('olivia', 'ver1')
    }
    if (initial === 'hint') {
      resetDialoguePopupSession('james', 'ver1')
    }
    return initial
  })
  const [exitingPage, setExitingPage] = useState<PageId | null>(null)
  const [direction, setDirection] = useState<TransitionDirection | null>(null)
  const [mode, setMode] = useState<TransitionMode | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scoreWipeActive, setScoreWipeActive] = useState(false)
  const [scoreWipeTarget, setScoreWipeTarget] =
    useState<ScoreWipeTarget>('score')

  useEffect(() => {
    ;[
      ...INTRO_PRELOAD,
      ...DIALOGUE_PRELOAD,
      ...DIALOGUE_V2_PRELOAD,
      ...JAMES_INTRO_PRELOAD,
      ...JAMES_DIALOGUE_PRELOAD,
      ...LEO_DIALOGUE_PRELOAD,
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
    if ((page === 'intro' || page === 'intro-v2') && !isTransitioning) {
      playIntroVoice()
      return
    }
    if (page !== 'score' && page !== 'score-v2') {
      stopIntroVoice()
    }
  }, [page, isTransitioning])

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

  const dialogueOnScreen =
    page === 'dialogue' ||
    exitingPage === 'dialogue' ||
    page === 'dialogue-v2' ||
    exitingPage === 'dialogue-v2'
  const jamesDialogueOnScreen =
    page === 'hint' ||
    exitingPage === 'hint' ||
    page === 'hint-v2' ||
    exitingPage === 'hint-v2'

  const getTransitionMode = (
    from: PageId,
    to: PageId,
    dir: TransitionDirection,
  ): TransitionMode => {
    if (dir === 'forward' && from === 'main' && to === 'intro-v2') {
      return 'push-left'
    }
    if (dir === 'forward' && from === 'main' && to === 'intro') {
      return 'fade'
    }
    if (
      dir === 'forward' &&
      (from === 'intro' || from === 'intro-v2') &&
      (to === 'dialogue' || to === 'dialogue-v2')
    ) {
      return 'circle'
    }
    if (
      dir === 'forward' &&
      (from === 'score' || from === 'score-v2') &&
      (to === 'hint' || to === 'hint-v2')
    ) {
      return 'circle'
    }
    return 'slide'
  }

  const navigate = useCallback(
    (next: PageId, dir: TransitionDirection) => {
      if (isTransitioning || next === page) return
      const track = trackForPage(next)
      if (next === 'dialogue' || next === 'dialogue-v2') {
        resetDialoguePopupSession('olivia', track)
      }
      if (next === 'hint' || next === 'hint-v2') {
        resetDialoguePopupSession('james', track)
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
    const order = getFlowOrder(page)
    if (!order) return
    const index = order.indexOf(page)
    if (index < order.length - 1) {
      navigate(order[index + 1], 'forward')
    }
  }, [navigate, page])

  const beginScoreWipe = useCallback(() => {
    if (isTransitioning || scoreWipeActive) return
    if (page === 'dialogue') {
      resetScorePageIntroVoice()
      setScoreWipeTarget('score')
      setIsTransitioning(true)
      setScoreWipeActive(true)
      return
    }
    if (page === 'dialogue-v2') {
      resetScorePageIntroVoice()
      setScoreWipeTarget('score-v2')
      setIsTransitioning(true)
      setScoreWipeActive(true)
    }
  }, [isTransitioning, page, scoreWipeActive])

  const finishScoreWipe = useCallback(() => {
    const track = scoreWipeTarget === 'score-v2' ? 'ver2' : 'ver1'
    setScoreWipeActive(false)
    setIsTransitioning(false)
    clearDialogueExitSnapshot(track)
    resetDialoguePopupSession('olivia', track)
    setPage(scoreWipeTarget)
  }, [scoreWipeTarget])

  const goBack = useCallback(() => {
    const order = getFlowOrder(page)
    if (!order) return
    const index = order.indexOf(page)
    if (index > 0) {
      navigate(order[index - 1], 'back')
    }
  }, [navigate, page])

  const goToFlowHome = useCallback((home: 'intro' | 'intro-v2') => {
    setScoreWipeActive(false)
    setExitingPage(null)
    setDirection(null)
    setMode(null)
    setIsTransitioning(false)
    clearDialogueExitSnapshot(trackForPage(home))
    resetDialoguePopupSession(undefined, trackForPage(home))
    resetScorePageIntroVoice()
    stopIntroVoice()
    setPage(home)
  }, [])

  const goToMain = useCallback(() => {
    setScoreWipeActive(false)
    setExitingPage(null)
    setDirection(null)
    setMode(null)
    setIsTransitioning(false)
    clearDialogueExitSnapshot('ver1')
    clearDialogueExitSnapshot('ver2')
    resetDialoguePopupSession()
    resetScorePageIntroVoice()
    stopIntroVoice()
    setPage('main')
  }, [])

  const renderPage = (id: PageId) => {
    switch (id) {
      case 'main':
        return (
          <PageMain
            onStartVer1={() => navigate('intro', 'forward')}
            onStartVer2={() => navigate('intro-v2', 'forward')}
            isTransitioning={isTransitioning}
          />
        )
      case 'intro':
        return (
          <Page1Intro
            onStart={goNext}
            onClose={() => goToFlowHome('intro')}
            isTransitioning={isTransitioning}
          />
        )
      case 'intro-v2':
        return (
          <Page1IntroV2
            onStart={goNext}
            onClose={() => goToFlowHome('intro-v2')}
            isTransitioning={isTransitioning}
          />
        )
      case 'dialogue':
        return (
          <Page2Dialogue
            onClose={() => goToFlowHome('intro')}
            onNext={beginScoreWipe}
            active={dialogueOnScreen}
            transitionComplete={dialogueOnScreen && !isTransitioning}
          />
        )
      case 'dialogue-v2':
        return (
          <Page2DialogueV2
            onClose={() => goToFlowHome('intro-v2')}
            onNext={beginScoreWipe}
            active={dialogueOnScreen}
            transitionComplete={dialogueOnScreen && !isTransitioning}
          />
        )
      case 'score':
        return (
          <Page4Intro
            onGo={goNext}
            onClose={() => goToFlowHome('intro')}
            isTransitioning={isTransitioning}
            suppressIntroAudio={scoreWipeActive && scoreWipeTarget === 'score'}
          />
        )
      case 'score-v2':
        return (
          <Page4IntroV2
            onGo={goNext}
            onClose={() => goToFlowHome('intro-v2')}
            isTransitioning={isTransitioning}
          />
        )
      case 'hint':
        return (
          <Page5JamesDialogue
            onClose={() => goToFlowHome('intro')}
            onNext={goToMain}
            active={jamesDialogueOnScreen}
            transitionComplete={jamesDialogueOnScreen && !isTransitioning}
          />
        )
      case 'hint-v2':
        return (
          <Page5JamesDialogueV2
            onClose={() => goToFlowHome('intro-v2')}
            onNext={goToMain}
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
        className={
          scoreWipeActive && scoreWipeTarget === 'score-v2'
            ? 'page-transition--score-wipe-push-left'
            : undefined
        }
        exitingChildren={exitingPage ? renderPage(exitingPage) : null}
        onTransitionEnd={clearTransition}
      >
        {renderPage(page)}
      </PageTransition>

      {scoreWipeActive && scoreWipeTarget === 'score' && (
        <PageWipeOverlay onComplete={finishScoreWipe}>
          <Page4Intro
            embedded
            onGo={goNext}
            onClose={() => goToFlowHome('intro')}
            isTransitioning={isTransitioning}
          />
        </PageWipeOverlay>
      )}

      {scoreWipeActive && scoreWipeTarget === 'score-v2' && (
        <PageWipeOverlay mode="push-left" onComplete={finishScoreWipe}>
          <Page4IntroV2
            embedded
            deferBoxEnter
            scoreWipeDurationMs={PAGE_TRANSITION_PUSH_LEFT_MS}
            onGo={goNext}
            onClose={() => goToFlowHome('intro-v2')}
            isTransitioning={isTransitioning}
          />
        </PageWipeOverlay>
      )}
    </>
  )
}

export default App
