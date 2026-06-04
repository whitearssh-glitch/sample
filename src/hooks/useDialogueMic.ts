import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DIALOGUE_HALO_FADE_MS,
  DIALOGUE_RESPONSE_POPUP_DELAY_MS,
  DIALOGUE_RESPONSE_START_DELAY_MS,
  DIALOGUE_VOICE_FALLBACK_MS,
  OLIVIA_DIALOGUE_VOICE,
  type DialogueVoiceProfile,
} from '../config/dialogueVoice'
import { playButtonSfx } from '../utils/pageAudio'

export type MicPhase =
  | 'idle'
  | 'listening'
  | 'mic-fade'
  | 'response'
  | 'response-halo-fade'
  | 'popup'

type UseDialogueMicOptions = {
  active: boolean
  voice?: DialogueVoiceProfile
  onShowPopup?: () => void
  /** 응답 할로 후 성공 팝업 대신 컨트롤 복귀 (제임스 5페이지) */
  afterResponse?: 'popup' | 'controls'
  /** 마이크 탭(시작·종료) 시 button.mp3 */
  playButtonSfxOnMic?: boolean
}

export function useDialogueMic({
  active,
  voice = OLIVIA_DIALOGUE_VOICE,
  onShowPopup,
  afterResponse = 'popup',
  playButtonSfxOnMic = false,
}: UseDialogueMicOptions) {
  const [phase, setPhase] = useState<MicPhase>('idle')
  const [controlsLocked, setControlsLocked] = useState(false)
  const [responseDurationSec, setResponseDurationSec] = useState<number | null>(
    null,
  )
  const sessionRef = useRef(0)
  const timersRef = useRef<{
    micFade: number | null
    responseHaloFade: number | null
    popupDelay: number | null
    responseFallback: number | null
  }>({ micFade: null, responseHaloFade: null, popupDelay: null, responseFallback: null })

  const clearTimers = useCallback(() => {
    if (timersRef.current.micFade !== null) {
      window.clearTimeout(timersRef.current.micFade)
      timersRef.current.micFade = null
    }
    if (timersRef.current.responseHaloFade !== null) {
      window.clearTimeout(timersRef.current.responseHaloFade)
      timersRef.current.responseHaloFade = null
    }
    if (timersRef.current.popupDelay !== null) {
      window.clearTimeout(timersRef.current.popupDelay)
      timersRef.current.popupDelay = null
    }
    if (timersRef.current.responseFallback !== null) {
      window.clearTimeout(timersRef.current.responseFallback)
      timersRef.current.responseFallback = null
    }
  }, [])

  const beginResponseHaloFade = useCallback(
    (session: number) => {
      if (session !== sessionRef.current) return
      setPhase('response-halo-fade')
      timersRef.current.responseHaloFade = window.setTimeout(() => {
        if (session !== sessionRef.current) return
        timersRef.current.responseHaloFade = null
        setResponseDurationSec(null)
        if (afterResponse === 'controls') {
          setControlsLocked(false)
          setPhase('idle')
          return
        }

        setPhase('popup')

        timersRef.current.popupDelay = window.setTimeout(() => {
          if (session !== sessionRef.current) return
          timersRef.current.popupDelay = null
          onShowPopup?.()
        }, DIALOGUE_RESPONSE_POPUP_DELAY_MS)
      }, DIALOGUE_HALO_FADE_MS)
    },
    [afterResponse, onShowPopup],
  )

  const startResponsePlayback = useCallback(
    (session: number) => {
      const applyDuration = (duration: number) => {
        if (Number.isFinite(duration) && duration > 0) {
          setResponseDurationSec(duration)
        }
      }

      if (!voice.responseVoiceSrc) {
        setResponseDurationSec(DIALOGUE_VOICE_FALLBACK_MS / 1000)
        timersRef.current.responseFallback = window.setTimeout(
          () => beginResponseHaloFade(session),
          DIALOGUE_VOICE_FALLBACK_MS,
        )
        return
      }

      const audio = new Audio(voice.responseVoiceSrc)
      audio.preload = 'auto'

      const onError = () => {
        if (session !== sessionRef.current) return
        setResponseDurationSec(DIALOGUE_VOICE_FALLBACK_MS / 1000)
        timersRef.current.responseFallback = window.setTimeout(
          () => beginResponseHaloFade(session),
          DIALOGUE_VOICE_FALLBACK_MS,
        )
      }

      const startPlayback = () => {
        if (session !== sessionRef.current) return
        applyDuration(audio.duration)
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
          setResponseDurationSec(DIALOGUE_VOICE_FALLBACK_MS / 1000)
        }
        void audio.play().catch(onError)
      }

      audio.addEventListener(
        'ended',
        () => {
          if (session === sessionRef.current) beginResponseHaloFade(session)
        },
        { once: true },
      )
      audio.addEventListener('error', onError, { once: true })

      if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
        startPlayback()
      } else {
        audio.addEventListener('loadedmetadata', () => startPlayback(), {
          once: true,
        })
        audio.load()
      }
    },
    [beginResponseHaloFade, voice.responseVoiceSrc],
  )

  const confirmListening = useCallback(() => {
    if (phase !== 'listening') return
    if (playButtonSfxOnMic) playButtonSfx()
    sessionRef.current += 1
    const session = sessionRef.current
    clearTimers()
    setControlsLocked(true)
    setPhase('mic-fade')

    timersRef.current.micFade = window.setTimeout(() => {
      if (session !== sessionRef.current) return
      timersRef.current.micFade = null
      setPhase('response')
      startResponsePlayback(session)
    }, DIALOGUE_RESPONSE_START_DELAY_MS)
  }, [clearTimers, phase, playButtonSfxOnMic, startResponsePlayback])

  const startMic = useCallback(() => {
    if (phase !== 'idle') return
    if (playButtonSfxOnMic) playButtonSfx()
    clearTimers()
    setPhase('listening')
  }, [clearTimers, phase, playButtonSfxOnMic])

  const toggleMic = useCallback(() => {
    if (phase === 'listening') {
      confirmListening()
      return
    }
    if (phase === 'idle') startMic()
  }, [confirmListening, phase, startMic])

  useEffect(() => {
    if (!active) {
      sessionRef.current += 1
      clearTimers()
      setPhase('idle')
      setControlsLocked(false)
      setResponseDurationSec(null)
    }
  }, [active, clearTimers])

  useEffect(() => () => clearTimers(), [clearTimers])

  const showMicButtonHalo = phase === 'listening' || phase === 'mic-fade'
  const showCharacterHalo =
    phase === 'response' || phase === 'response-halo-fade'
  const isResponsePlaying = phase === 'response'
  const isResponseHaloFading = phase === 'response-halo-fade'
  const isMicBusy =
    phase === 'listening' ||
    phase === 'mic-fade' ||
    phase === 'response' ||
    phase === 'response-halo-fade' ||
    phase === 'popup'

  return {
    phase,
    controlsHidden: controlsLocked,
    showMicButtonHalo,
    showCharacterHalo,
    isListening: phase === 'listening',
    isMicFading: phase === 'mic-fade',
    isResponsePlaying,
    isResponseHaloFading,
    isMicBusy,
    responseDurationSec,
    toggleMic,
  }
}
