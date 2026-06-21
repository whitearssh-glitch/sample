import {
  useEffect,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import { MobileShell } from '../components/MobileShell'
import { PageHeader } from '../components/PageHeader'
import { Pressable } from '../components/Pressable'
import { stopIntroVoice, playOpenSfx, unlockPageAudioFromGesture } from '../utils/pageAudio'

const V2 = '/assets/ver2/sources'

const ASSETS = {
  missionFrame: `${V2}/mission-frame.png`,
  missionTitle: `${V2}/mission-title.png`,
  expressions: [
    `${V2}/mission-expression-01.png`,
    `${V2}/mission-expression-02.png`,
    `${V2}/mission-expression-03.png`,
    `${V2}/mission-expression-04.png`,
  ],
  startButton: `${V2}/button-start.png`,
  lock: `${V2}/lock.png`,
} as const

const CHARACTERS = [
  {
    id: 'emma',
    label: 'Emma',
    card: `${V2}/mission-emma.png`,
    name: `${V2}/name-emma.png`,
    locked: false,
  },
  {
    id: 'leo',
    label: 'Leo',
    card: `${V2}/mission-leo.png`,
    name: `${V2}/name-leo.png`,
    locked: true,
  },
  {
    id: 'drchoi',
    label: 'Dr. Choi',
    card: `${V2}/mission-drchoi.png`,
    name: `${V2}/name-drchoi.png`,
    locked: true,
  },
] as const

const CHIP_ALTS = [
  'Nice to meet you',
  'I am',
  'It is',
  'I am __ years old',
] as const

type Page1IntroV2Props = {
  onStart: () => void
  onClose: () => void
  isTransitioning?: boolean
}

export function Page1IntroV2({ onStart, onClose, isTransitioning }: Page1IntroV2Props) {
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
        className="page-intro-v2"
        aria-label="미션 소개"
        onPointerDownCapture={handleIntroPointerDown}
      >
        <PageHeader onClose={onClose} />

        <div className="page-intro-v2__body">
          <div className="page-intro-v2__mission">
            <div
              className="intro-v2-mission-card intro-v2-box-enter"
              style={{ '--enter-order': 0 } as CSSProperties}
            >
              <img
                className="intro-v2-mission-card__frame"
                src={ASSETS.missionFrame}
                alt=""
                aria-hidden
              />
              <img
                className="intro-v2-mission-card__title"
                src={ASSETS.missionTitle}
                alt="처음 만나서 자기소개하기"
              />
              <div className="intro-v2-mission-card__chips">
                <div className="intro-v2-mission-card__chip-row">
                  {ASSETS.expressions.slice(0, 3).map((src, index) => (
                    <Pressable
                      key={src}
                      variant="chip"
                      className={
                        activeChip === index
                          ? 'intro-v2-mission-chip is-active'
                          : 'intro-v2-mission-chip'
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
                <div className="intro-v2-mission-card__chip-row intro-v2-mission-card__chip-row--center">
                  <Pressable
                    variant="chip"
                    className={
                      activeChip === 3
                        ? 'intro-v2-mission-chip is-active'
                        : 'intro-v2-mission-chip'
                    }
                    aria-pressed={activeChip === 3}
                    onClick={() => setActiveChip((prev) => (prev === 3 ? null : 3))}
                  >
                    <img src={ASSETS.expressions[3]} alt={CHIP_ALTS[3]} />
                  </Pressable>
                </div>
              </div>
            </div>
          </div>

          <ul className="page-intro-v2__characters">
            {CHARACTERS.map((character, index) => (
              <li key={character.id} className="intro-v2-character">
                <article
                  className={[
                    'intro-v2-character__card',
                    'intro-v2-box-enter',
                    character.locked ? 'intro-v2-character__card--locked' : '',
                    character.id === 'emma' ? 'intro-v2-character__card--lead' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{
                    '--enter-order': index + 1,
                    ...(character.locked || character.id === 'emma'
                      ? { '--card-mask': `url(${character.card})` }
                      : {}),
                  } as CSSProperties}
                >
                  <img
                    className="intro-v2-character__bg"
                    src={character.card}
                    alt=""
                    aria-hidden
                  />
                  <img
                    className="intro-v2-character__name"
                    src={character.name}
                    alt={character.label}
                  />
                  {character.locked ? (
                    <img
                      className="intro-v2-character__lock"
                      src={ASSETS.lock}
                      alt="잠김"
                    />
                  ) : (
                    <Pressable
                      variant="cta"
                      className="intro-v2-character__start"
                      aria-label="시작하기"
                      disabled={isTransitioning}
                      onClick={handleStart}
                    >
                      <img src={ASSETS.startButton} alt="Start" />
                    </Pressable>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </MobileShell>
  )
}
