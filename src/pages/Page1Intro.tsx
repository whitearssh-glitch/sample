import { useEffect, useState, type PointerEvent } from 'react'
import { MobileShell } from '../components/MobileShell'
import { PageHeader } from '../components/PageHeader'
import { Pressable } from '../components/Pressable'
import { stopIntroVoice, playOpenSfx, unlockPageAudioFromGesture } from '../utils/pageAudio'

const ASSETS = {
  background: '/assets/background-olivia.png',
  missionFrame: '/assets/mission-frame.png',
  missionRibbon: '/assets/mission-ribbon.png',
  missionTitle: '/assets/mission-title.png',
  expressions: [
    '/assets/mission-expression-01.png',
    '/assets/mission-expression-02.png',
    '/assets/mission-expression-03.png',
    '/assets/mission-expression-04.png',
  ],
  characterFrame: '/assets/character-frame.png',
  characterName: '/assets/character-name-olivia.png',
  characterPicture: '/assets/character-picture-olivia.png',
  startButton: '/assets/button-start.png',
} as const

const CHIP_ALTS = [
  'Nice to meet you',
  'I am',
  'It is',
  'I am __ years old',
] as const

type Page1IntroProps = {
  onStart: () => void
  onClose: () => void
  isTransitioning?: boolean
}

export function Page1Intro({ onStart, onClose, isTransitioning }: Page1IntroProps) {
  const [activeChip, setActiveChip] = useState<number | null>(null)

  useEffect(() => {
    if (isTransitioning) stopIntroVoice()
  }, [isTransitioning])

  const handleIntroPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return
    unlockPageAudioFromGesture()
  }

  const handleStart = () => {
    if (isTransitioning) return
    stopIntroVoice()
    playOpenSfx()
    onStart()
  }

  return (
    <MobileShell>
      <section
        className="page-intro"
        aria-label="미션 소개"
        onPointerDownCapture={handleIntroPointerDown}
      >
        <img
          className="page-intro__bg"
          src={ASSETS.background}
          alt=""
          aria-hidden
        />

        <PageHeader onClose={onClose} />

        <div className="page-intro__body">
        <div className="page-intro__mission">
          <div className="mission-card">
            <img
              className="mission-card__frame"
              src={ASSETS.missionFrame}
              alt=""
              aria-hidden
            />
            <img
              className="mission-card__ribbon"
              src={ASSETS.missionRibbon}
              alt="Mission"
            />
            <img
              className="mission-card__title"
              src={ASSETS.missionTitle}
              alt="처음 만나서 자기소개하기"
            />
            <div className="mission-card__chips">
              <div className="mission-card__chip-row">
                {ASSETS.expressions.slice(0, 2).map((src, index) => (
                  <Pressable
                    key={src}
                    variant="chip"
                    className={
                      activeChip === index ? 'mission-chip is-active' : 'mission-chip'
                    }
                    aria-pressed={activeChip === index}
                    onClick={() =>
                      setActiveChip((prev) => (prev === index ? null : index))
                    }
                  >
                    <img src={src} alt={CHIP_ALTS[index]} />
                  </Pressable>
                ))}
              </div>
              <div className="mission-card__chip-row mission-card__chip-row--second">
                {ASSETS.expressions.slice(2, 4).map((src, index) => {
                  const chipIndex = index + 2
                  return (
                    <Pressable
                      key={src}
                      variant="chip"
                      className={
                        activeChip === chipIndex
                          ? 'mission-chip is-active'
                          : 'mission-chip'
                      }
                      aria-pressed={activeChip === chipIndex}
                      onClick={() =>
                        setActiveChip((prev) =>
                          prev === chipIndex ? null : chipIndex,
                        )
                      }
                    >
                      <img src={src} alt={CHIP_ALTS[chipIndex]} />
                    </Pressable>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="page-intro__character">
          <div className="character-card">
            <img
              className="character-card__picture"
              src={ASSETS.characterPicture}
              alt="Olivia 캐릭터"
            />
            <img
              className="character-card__name"
              src={ASSETS.characterName}
              alt="Olivia"
            />
            <div className="character-card__chrome" aria-hidden>
              <img
                className="character-card__frame"
                src={ASSETS.characterFrame}
                alt=""
              />
            <Pressable
              variant="cta"
              className="character-card__start"
              aria-label="시작하기"
              disabled={isTransitioning}
              onClick={handleStart}
            >
                <img src={ASSETS.startButton} alt="Start" />
              </Pressable>
            </div>
          </div>
        </div>
        </div>
      </section>
    </MobileShell>
  )
}
