import { PAGE_TRANSITION_COVER_MS } from '../components/PageTransition'
import { DIALOGUE_POPUP_ENTRANCE } from '../config/dialoguePopupLayout'
import { JAMES_DIALOGUE_POPUP_ENTRANCE } from '../config/jamesDialoguePopupLayout'
import {
  BUTTON_SFX_SRC,
  INTRO_VOICE_SRC,
  OPEN2_VOICE_SRC,
  OPEN_VOICE_PLAYBACK_RATE,
  OPEN_VOICE_SRC,
} from '../config/pageSounds'

/** 닦기 전환 끝나기 전 intro 재생 (제임스 인트로) */
export const SCORE_INTRO_VOICE_LEAD_MS = 350

let introAudio: HTMLAudioElement | null = null
let introPlayPending = false
let gestureRetryInstalled = false

function getIntroAudio(): HTMLAudioElement {
  if (!introAudio) {
    introAudio = new Audio(INTRO_VOICE_SRC)
    introAudio.preload = 'auto'
  }
  return introAudio
}

function installGestureRetry() {
  if (gestureRetryInstalled) return
  gestureRetryInstalled = true

  const retry = () => {
    gestureRetryInstalled = false
    if (introPlayPending) void playIntroVoice()
  }

  for (const type of ['pointerdown', 'touchstart', 'keydown'] as const) {
    document.addEventListener(type, retry, { once: true, capture: true })
  }
}

/** 브라우저 자동재생: muted로 시작한 뒤 바로 소리 켬 */
async function tryPlayIntro(audio: HTMLAudioElement): Promise<boolean> {
  audio.currentTime = 0

  try {
    audio.muted = true
    await audio.play()
    audio.muted = false
    introPlayPending = false
    return true
  } catch {
    audio.muted = false
    try {
      await audio.play()
      introPlayPending = false
      return true
    } catch {
      return false
    }
  }
}

export function playIntroVoice(): void {
  const audio = getIntroAudio()
  if (
    !introPlayPending &&
    !audio.paused &&
    audio.currentTime > 0 &&
    !audio.ended
  ) {
    return
  }

  introPlayPending = true

  const start = () => {
    void tryPlayIntro(audio).then((ok) => {
      if (!ok) installGestureRetry()
    })
  }

  if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    start()
    return
  }

  const onReady = () => {
    audio.removeEventListener('canplaythrough', onReady)
    start()
  }
  audio.addEventListener('canplaythrough', onReady)
  audio.load()
}

let scorePageIntroStarted = false

/** 제임스 인트로(score) — 닦기·직접 진입 공통 1회 */
export function playScorePageIntroVoice(): void {
  if (scorePageIntroStarted) return
  scorePageIntroStarted = true
  playIntroVoice()
}

export function resetScorePageIntroVoice(): void {
  scorePageIntroStarted = false
}

/** 닦기 오버레이: 전환 완료 직전 intro */
export function scheduleScoreIntroVoiceNearWipeEnd(): number {
  return window.setTimeout(() => {
    playScorePageIntroVoice()
  }, Math.max(0, PAGE_TRANSITION_COVER_MS - SCORE_INTRO_VOICE_LEAD_MS))
}

export function stopIntroVoice(): void {
  introPlayPending = false
  if (!introAudio) return
  introAudio.pause()
  introAudio.currentTime = 0
  introAudio.muted = false
}

/** 첫 터치 시 음성 잠금 해제 + 대기 중인 intro 재시도 */
let oliviaPopupOpenAudio: HTMLAudioElement | null = null
let oliviaPopupSfxChainActive = false
let oliviaPopupStampTimer: number | null = null

/** 올리비아 성공 팝업: popup.mp3 + sfxDelayMs 후 fb2 (Strict Mode에서 1회) */
export function playOliviaPopupEntranceSfx(): void {
  if (oliviaPopupSfxChainActive) return
  oliviaPopupSfxChainActive = true

  if (!oliviaPopupOpenAudio) {
    oliviaPopupOpenAudio = new Audio(DIALOGUE_POPUP_ENTRANCE.openSfxSrc)
    oliviaPopupOpenAudio.preload = 'auto'
  }

  const open = oliviaPopupOpenAudio
  open.currentTime = 0
  void open.play().catch(() => {})

  oliviaPopupStampTimer = window.setTimeout(() => {
    oliviaPopupStampTimer = null
    const stamp = new Audio(DIALOGUE_POPUP_ENTRANCE.sfxSrc)
    stamp.preload = 'auto'
    void stamp.play().catch(() => {})
    oliviaPopupSfxChainActive = false
  }, DIALOGUE_POPUP_ENTRANCE.sfxDelayMs)
}

let jamesPopupOpenAudio: HTMLAudioElement | null = null
let jamesPopupSfxChainActive = false
let jamesPopupStampTimer: number | null = null

/** 제임스 성공 팝업: popup2.mp3 + superDelayMs 후 fb1 (Strict Mode에서 1회) */
export function playJamesPopupEntranceSfx(): void {
  if (jamesPopupSfxChainActive) return
  jamesPopupSfxChainActive = true

  if (!jamesPopupOpenAudio) {
    jamesPopupOpenAudio = new Audio(JAMES_DIALOGUE_POPUP_ENTRANCE.openSfxSrc)
    jamesPopupOpenAudio.preload = 'auto'
  }

  const open = jamesPopupOpenAudio
  open.currentTime = 0
  void open.play().catch(() => {})

  jamesPopupStampTimer = window.setTimeout(() => {
    jamesPopupStampTimer = null
    const stamp = new Audio(JAMES_DIALOGUE_POPUP_ENTRANCE.sfxSrc)
    stamp.preload = 'auto'
    void stamp.play().catch(() => {})
    jamesPopupSfxChainActive = false
  }, JAMES_DIALOGUE_POPUP_ENTRANCE.superDelayMs)
}

export function resetJamesPopupEntranceSfx(): void {
  if (jamesPopupStampTimer !== null) {
    window.clearTimeout(jamesPopupStampTimer)
    jamesPopupStampTimer = null
  }
  jamesPopupSfxChainActive = false
  if (!jamesPopupOpenAudio) return
  jamesPopupOpenAudio.pause()
  jamesPopupOpenAudio.currentTime = 0
}

export function resetOliviaPopupEntranceSfx(): void {
  if (oliviaPopupStampTimer !== null) {
    window.clearTimeout(oliviaPopupStampTimer)
    oliviaPopupStampTimer = null
  }
  oliviaPopupSfxChainActive = false
  if (!oliviaPopupOpenAudio) return
  oliviaPopupOpenAudio.pause()
  oliviaPopupOpenAudio.currentTime = 0
}

export function playOpenSfx(): void {
  const audio = new Audio(OPEN_VOICE_SRC)
  audio.preload = 'auto'
  audio.playbackRate = OPEN_VOICE_PLAYBACK_RATE
  void audio.play().catch(() => {})
}

export function playOpen2Sfx(): void {
  const audio = new Audio(OPEN2_VOICE_SRC)
  audio.preload = 'auto'
  void audio.play().catch(() => {})
}

export function playButtonSfx(): void {
  const audio = new Audio(BUTTON_SFX_SRC)
  audio.preload = 'auto'
  void audio.play().catch(() => {})
}

export function unlockPageAudioFromGesture(): void {
  const probe = new Audio()
  probe.muted = true
  void probe.play().then(() => {
    probe.pause()
    if (introPlayPending) playIntroVoice()
  }).catch(() => {
    if (introPlayPending) playIntroVoice()
  })
}
