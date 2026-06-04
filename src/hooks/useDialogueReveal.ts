import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DIALOGUE_HALO_FADE_MS,
  DIALOGUE_VOICE_FALLBACK_MS,
  OLIVIA_DIALOGUE_VOICE,
  type DialogueVoiceProfile,
} from '../config/dialogueVoice'

export type DialogueRevealPhase = 'hero' | 'voice' | 'halo-fade' | 'controls'

type UseDialogueRevealOptions = {
  transitionComplete: boolean
  active: boolean
  voice?: DialogueVoiceProfile
}

export function useDialogueReveal({
  transitionComplete,
  active,
  voice = OLIVIA_DIALOGUE_VOICE,
}: UseDialogueRevealOptions) {
  const [phase, setPhase] = useState<DialogueRevealPhase>('hero')
  const [voiceDurationSec, setVoiceDurationSec] = useState<number | null>(null)
  const [controlsVisible, setControlsVisible] = useState(false)
  const sessionRef = useRef(0)
  const initialStartedRef = useRef(false)
  const timersRef = useRef<{
    fallback: number | null
    haloFade: number | null
  }>({ fallback: null, haloFade: null })

  const clearTimers = useCallback(() => {
    if (timersRef.current.fallback !== null) {
      window.clearTimeout(timersRef.current.fallback)
      timersRef.current.fallback = null
    }
    if (timersRef.current.haloFade !== null) {
      window.clearTimeout(timersRef.current.haloFade)
      timersRef.current.haloFade = null
    }
  }, [])

  const finishVoice = useCallback(
    (session: number) => {
      if (session !== sessionRef.current) return
      setPhase('halo-fade')
      clearTimers()
      timersRef.current.haloFade = window.setTimeout(() => {
        if (session !== sessionRef.current) return
        setControlsVisible(true)
        setPhase('controls')
      }, DIALOGUE_HALO_FADE_MS)
    },
    [clearTimers],
  )

  const playVoice = useCallback(() => {
    sessionRef.current += 1
    const session = sessionRef.current
    clearTimers()

    const applyDuration = (duration: number) => {
      if (Number.isFinite(duration) && duration > 0) {
        setVoiceDurationSec(duration)
      }
    }

    if (!voice.voiceSrc) {
      setVoiceDurationSec(DIALOGUE_VOICE_FALLBACK_MS / 1000)
      setPhase('voice')
      timersRef.current.fallback = window.setTimeout(
        () => finishVoice(session),
        DIALOGUE_VOICE_FALLBACK_MS,
      )
      return
    }

    const audio = new Audio(voice.voiceSrc)
    audio.preload = 'auto'

    const onError = () => {
      if (session !== sessionRef.current) return
      setVoiceDurationSec(DIALOGUE_VOICE_FALLBACK_MS / 1000)
      timersRef.current.fallback = window.setTimeout(
        () => finishVoice(session),
        DIALOGUE_VOICE_FALLBACK_MS,
      )
    }

    const startPlayback = () => {
      if (session !== sessionRef.current) return
      applyDuration(audio.duration)
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        setVoiceDurationSec(DIALOGUE_VOICE_FALLBACK_MS / 1000)
      }
      setPhase('voice')
      void audio.play().catch(onError)
    }

    audio.addEventListener(
      'ended',
      () => {
        if (session === sessionRef.current) finishVoice(session)
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
  }, [clearTimers, finishVoice, voice.voiceSrc])

  const replayVoice = useCallback(() => {
    if (phase === 'voice' || phase === 'halo-fade') return
    playVoice()
  }, [phase, playVoice])

  useEffect(() => {
    if (!active) {
      sessionRef.current += 1
      clearTimers()
      initialStartedRef.current = false
      setPhase('hero')
      setControlsVisible(false)
      setVoiceDurationSec(null)
      return
    }

    if (!transitionComplete || initialStartedRef.current) return
    initialStartedRef.current = true
    playVoice()
  }, [active, clearTimers, playVoice, transitionComplete])

  const isVoiceActive = phase === 'voice' || phase === 'halo-fade'

  return {
    phase,
    controlsVisible,
    showHalo: isVoiceActive,
    isVoicePlaying: phase === 'voice',
    isHaloFading: phase === 'halo-fade',
    isVoiceActive,
    voiceDurationSec,
    replayVoice,
  }
}
