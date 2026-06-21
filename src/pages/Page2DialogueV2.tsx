import { useCallback, useRef, useState, type CSSProperties } from 'react'
import { DialogueSuccessPopup } from '../components/DialogueSuccessPopup'
import { MobileShell } from '../components/MobileShell'
import { PageHeader } from '../components/PageHeader'
import { Pressable } from '../components/Pressable'
import { isPopupPreview } from '../config/devPreview'
import { DIALOGUE_VOICE_FALLBACK_MS, EMMA_DIALOGUE_VOICE } from '../config/dialogueVoice'
import { useDialogueMic } from '../hooks/useDialogueMic'
import { useDialogueReveal } from '../hooks/useDialogueReveal'
import {
  captureDialogueExitSnapshot,
  consumeDialogueExitSnapshot,
  type DialogueExitSnapshot,
} from '../utils/dialogueExitSnapshot'

const V2 = '/assets/ver2/sources'

const ASSETS = {
  background: `${V2}/background-dialogue-emma.png`,
  character: `${V2}/character-emma.png`,
  replay: `${V2}/button-replay.png`,
  hintBulb: '/assets/hint-bulb.png',
  hint01: '/assets/hint-01.png',
  hint02: '/assets/hint-02.png',
  microphone: `${V2}/button-microphone.png`,
} as const

type Page2DialogueV2Props = {
  onClose: () => void
  onNext?: () => void
  transitionComplete: boolean
  active: boolean
}

export function Page2DialogueV2({
  onClose,
  onNext,
  transitionComplete,
  active,
}: Page2DialogueV2Props) {
  const consumedSnapshotRef = useRef(consumeDialogueExitSnapshot('ver2'))
  const [wipeFrozenSnapshot, setWipeFrozenSnapshot] =
    useState<DialogueExitSnapshot | null>(null)
  const frozenSnapshot = wipeFrozenSnapshot ?? consumedSnapshotRef.current
  const isFrozen = Boolean(frozenSnapshot)
  const hookActive = active && !isFrozen

  const [activeHint, setActiveHint] = useState<number | null>(null)
  const [popupOpen, setPopupOpen] = useState(
    () => consumedSnapshotRef.current?.popupOpen ?? isPopupPreview(),
  )

  const handleShowPopup = useCallback(() => {
    setPopupOpen(true)
  }, [])

  const {
    phase: revealPhase,
    controlsVisible,
    showHalo: showVoiceHalo,
    isVoicePlaying,
    isHaloFading: isVoiceHaloFading,
    isVoiceActive,
    voiceDurationSec,
    replayVoice,
  } = useDialogueReveal({
    transitionComplete,
    active: hookActive,
    voice: EMMA_DIALOGUE_VOICE,
  })

  const {
    phase: micPhase,
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
    active: hookActive,
    voice: EMMA_DIALOGUE_VOICE,
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

  const buildLiveSectionClass = () =>
    [
      'page-dialogue',
      'page-dialogue--emma',
      'page-dialogue--hero',
      isVoicePlaying || showResponseVoiceHalo ? 'page-dialogue--voice' : '',
      isMicListening ? 'page-dialogue--mic-active' : '',
      isVoiceHaloFading || isResponseHaloFading
        ? 'page-dialogue--halo-fade'
        : '',
      isMicHaloFading ? 'page-dialogue--mic-halo-fade' : '',
      controlsVisible ? 'page-dialogue--controls' : '',
      controlsHidden || popupOpen ? 'page-dialogue--controls-hidden' : '',
    ]
      .filter(Boolean)
      .join(' ')

  const sectionClass = isFrozen
    ? `${frozenSnapshot!.sectionClass} page-dialogue--frozen`
    : buildLiveSectionClass()

  const sectionStyle = isFrozen ? frozenSnapshot!.voiceStyle : voiceStyle

  const handleScoreWipeNext = () => {
    const snapshot: DialogueExitSnapshot = {
      sectionClass: buildLiveSectionClass(),
      voiceStyle,
      popupOpen,
    }
    captureDialogueExitSnapshot(snapshot, 'ver2')
    setWipeFrozenSnapshot(snapshot)
    onNext?.()
  }

  const handleMicClick = () => {
    if (isFrozen || popupOpen || isVoiceActive || controlsHidden) return
    toggleMic()
  }

  return (
    <MobileShell>
      <section
        className={sectionClass}
        style={sectionStyle}
        aria-label="대화"
        data-dialogue-phase={isFrozen ? undefined : revealPhase}
        data-mic-phase={isFrozen ? undefined : micPhase}
      >
        <img
          className="page-dialogue__bg"
          src={ASSETS.background}
          alt=""
          aria-hidden
        />

        <PageHeader onClose={onClose} />

        <div className="page-dialogue__content">
          <div className="page-dialogue__character-wrap">
            {!isFrozen && showCharacterHalo && (
              <>
                <div
                  className="page-dialogue__character-halo page-dialogue__character-halo--outer"
                  aria-hidden
                />
                <div className="page-dialogue__character-halo" aria-hidden />
              </>
            )}
            <img
              className="page-dialogue__character"
              src={ASSETS.character}
              alt="Emma"
            />
          </div>

          <div
            className="page-dialogue__controls"
            aria-hidden={!showControlsUi}
          >
            <Pressable
              variant="cta"
              className="page-dialogue__replay"
              aria-label="다시 듣기"
              tabIndex={showControlsUi ? 0 : -1}
              disabled={haloBusy || popupOpen}
              onClick={replayVoice}
            >
              <img src={ASSETS.replay} alt="" />
            </Pressable>

            <div className="page-dialogue__hints">
              <div className="page-dialogue__hint-bulb-wrap">
                <img
                  className="page-dialogue__hint-bulb"
                  src={ASSETS.hintBulb}
                  alt=""
                  aria-hidden
                />
              </div>
              <div className="page-dialogue__hint-chips">
                {[ASSETS.hint01, ASSETS.hint02].map((src, index) => (
                  <Pressable
                    key={src}
                    variant="chip"
                    className={
                      activeHint === index
                        ? 'dialogue-hint is-active'
                        : 'dialogue-hint'
                    }
                    aria-pressed={activeHint === index}
                    tabIndex={showControlsUi ? 0 : -1}
                    disabled={haloBusy}
                    onClick={() =>
                      setActiveHint((prev) => (prev === index ? null : index))
                    }
                  >
                    <img src={src} alt={index === 0 ? 'I am' : 'My name is'} />
                  </Pressable>
                ))}
              </div>
            </div>

            <div className="page-dialogue__mic-area">
              <div className="page-dialogue__mic-wrap">
                {showMicButtonHalo && (
                  <div className="page-dialogue__mic-glow" aria-hidden />
                )}
                <Pressable
                  variant="cta"
                  className="page-dialogue__mic"
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

        {((!isFrozen && popupOpen) ||
          (isFrozen && frozenSnapshot!.popupOpen)) && (
          <DialogueSuccessPopup
            track="ver2"
            onNext={isFrozen ? () => {} : handleScoreWipeNext}
          />
        )}
      </section>
    </MobileShell>
  )
}
