import { useCallback, useState, type CSSProperties } from 'react'
import { DialogueSuccessPopup } from '../components/DialogueSuccessPopup'
import { MobileShell } from '../components/MobileShell'
import { PageHeader } from '../components/PageHeader'
import { Pressable } from '../components/Pressable'
import { isJamesPopupPreview } from '../config/devPreview'
import {
  DIALOGUE_VOICE_FALLBACK_MS,
  LEO_DIALOGUE_VOICE,
} from '../config/dialogueVoice'
import { useDialogueMic } from '../hooks/useDialogueMic'
import { useDialogueReveal } from '../hooks/useDialogueReveal'

const V2 = '/assets/ver2/sources'

const ASSETS = {
  background: `${V2}/background-dialogue-leo.png`,
  character: `${V2}/character-leo.png`,
  replay: '/assets/button-replay.png',
  microphone: '/assets/button-microphone.png',
} as const

type Page5JamesDialogueV2Props = {
  onClose: () => void
  onNext?: () => void
  transitionComplete: boolean
  active: boolean
}

export function Page5JamesDialogueV2({
  onClose,
  onNext,
  transitionComplete,
  active,
}: Page5JamesDialogueV2Props) {
  const [popupOpen, setPopupOpen] = useState(() => isJamesPopupPreview())

  const handleShowPopup = useCallback(() => {
    setPopupOpen(true)
  }, [])
  const {
    controlsVisible,
    showHalo: showVoiceHalo,
    isVoicePlaying,
    isHaloFading: isVoiceHaloFading,
    isVoiceActive,
    voiceDurationSec,
    replayVoice,
  } = useDialogueReveal({
    transitionComplete,
    active,
    voice: LEO_DIALOGUE_VOICE,
  })

  const {
    controlsHidden,
    showMicButtonHalo,
    showCharacterHalo: showResponseCharacterHalo,
    isListening: isMicListening,
    isMicFading: isMicHaloFading,
    isResponsePlaying,
    isResponseHaloFading,
    isMicBusy,
    responseDurationSec,
    toggleMic,
  } = useDialogueMic({
    active,
    voice: LEO_DIALOGUE_VOICE,
    afterResponse: 'popup',
    onShowPopup: handleShowPopup,
    playButtonSfxOnMic: true,
  })

  const showCharacterHalo = showVoiceHalo || showResponseCharacterHalo
  const showControlsUi = controlsVisible && !controlsHidden
  const haloBusy = isVoiceActive || isMicBusy

  const voiceDuration =
    voiceDurationSec ?? DIALOGUE_VOICE_FALLBACK_MS / 1000
  const responseDuration =
    responseDurationSec ?? DIALOGUE_VOICE_FALLBACK_MS / 1000

  const showResponseVoiceHalo = isResponsePlaying

  const voiceStyle: CSSProperties | undefined =
    isVoicePlaying || isVoiceHaloFading
      ? ({ '--voice-duration': `${voiceDuration}s` } as CSSProperties)
      : showResponseVoiceHalo
        ? ({ '--voice-duration': `${responseDuration}s` } as CSSProperties)
        : undefined

  const sectionClass = [
    'page-dialogue',
    'page-dialogue--hero',
    'page-dialogue--leo',
    'page-dialogue--no-hints',
    isVoicePlaying || showResponseVoiceHalo ? 'page-dialogue--voice' : '',
    isMicListening ? 'page-dialogue--mic-active' : '',
    isVoiceHaloFading || isResponseHaloFading ? 'page-dialogue--halo-fade' : '',
    isMicHaloFading ? 'page-dialogue--mic-halo-fade' : '',
    controlsVisible ? 'page-dialogue--controls' : '',
    controlsHidden || popupOpen ? 'page-dialogue--controls-hidden' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleMicClick = () => {
    if (popupOpen || isVoiceActive || controlsHidden) return
    toggleMic()
  }

  return (
    <MobileShell>
      <section
        className={sectionClass}
        style={voiceStyle}
        aria-label="제임스 대화"
      >
        <img
          className="page-dialogue__bg"
          src={ASSETS.background}
          alt=""
          aria-hidden
        />

        <PageHeader className="page-header--light" onClose={onClose} />

        <div className="page-dialogue__content">
          <div className="page-dialogue__character-wrap">
            {showCharacterHalo && (
              <>
                <div
                  className="page-dialogue__character-halo page-dialogue__character-halo--outer"
                  aria-hidden
                />
                <div
                  className="page-dialogue__character-halo page-dialogue__character-halo--ground"
                  aria-hidden
                />
                <div
                  className="page-dialogue__character-halo page-dialogue__character-halo--ring"
                  aria-hidden
                />
                <div className="page-dialogue__character-halo" aria-hidden />
              </>
            )}
            <img
              className="page-dialogue__character"
              src={ASSETS.character}
              alt="Leo"
            />
          </div>

          <div
            className="page-dialogue__controls"
            aria-hidden={!showControlsUi}
          >
            <Pressable
              variant="icon"
              className="page-dialogue__replay pressable--no-hover"
              aria-label="다시 듣기"
              tabIndex={showControlsUi ? 0 : -1}
              disabled={haloBusy || popupOpen}
              onClick={replayVoice}
            >
              <img src={ASSETS.replay} alt="" />
            </Pressable>

            <div className="page-dialogue__mic-area">
              <div className="page-dialogue__mic-wrap">
                {showMicButtonHalo && (
                  <div className="page-dialogue__mic-glow" aria-hidden />
                )}
                <Pressable
                  variant="cta"
                  className="page-dialogue__mic pressable--no-hover"
                  aria-label={isMicListening ? '말하기 멈추기' : '말하기'}
                  aria-pressed={isMicListening}
                  disabled={!showControlsUi || isVoiceActive}
                  tabIndex={showControlsUi ? 0 : -1}
                  onClick={handleMicClick}
                >
                  <img src={ASSETS.microphone} alt="" />
                </Pressable>
              </div>
            </div>
          </div>
        </div>

        {isVoicePlaying && (
          <span className="visually-hidden" aria-live="polite">
            음성 재생 중
          </span>
        )}
        {isMicListening && (
          <span className="visually-hidden" aria-live="polite">
            말하기 중
          </span>
        )}
        {isResponsePlaying && (
          <span className="visually-hidden" aria-live="polite">
            응답 재생 중
          </span>
        )}

        {popupOpen && (
          <DialogueSuccessPopup
            variant="james"
            track="ver2"
            onNext={() => {
              setPopupOpen(false)
              onNext?.()
            }}
          />
        )}
      </section>
    </MobileShell>
  )
}
