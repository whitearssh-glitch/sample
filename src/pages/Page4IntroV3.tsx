import { useEffect, type CSSProperties } from 'react'
import { MobileShell } from '../components/MobileShell'
import { PageHeader } from '../components/PageHeader'
import { Pressable } from '../components/Pressable'
import { PAGE_TRANSITION_PUSH_LEFT_MS } from '../components/PageTransition'
import {
  playOpenSfx,
  playScorePageIntroVoice,
  scheduleScoreIntroVoiceNearWipeEnd,
  stopIntroVoice,
} from '../utils/pageAudio'

const V3 = '/assets/ver3/sources'

const ASSETS = {
  startButton: `${V3}/button-start.png`,
  goodBadge: `${V3}/score-good.png`,
  lock: `${V3}/lock.png`,
} as const

type CharacterState = 'completed' | 'active' | 'locked'

const CHARACTERS: ReadonlyArray<{
  id: string
  label: string
  card: string
  name: string
  state: CharacterState
}> = [
  {
    id: 'emma',
    label: 'Emma',
    card: `${V3}/mission-emma.png`,
    name: `${V3}/name-emma.png`,
    state: 'completed',
  },
  {
    id: 'leo',
    label: 'Leo',
    card: `${V3}/mission-leo.png`,
    name: `${V3}/name-leo.png`,
    state: 'active',
  },
  {
    id: 'drchoi',
    label: 'Dr. Choi',
    card: `${V3}/mission-drchoi.png`,
    name: `${V3}/name-drchoi.png`,
    state: 'locked',
  },
]

type Page4IntroV3Props = {
  onGo: () => void
  onClose: () => void
  isTransitioning?: boolean
  /** 닦기 오버레이 안에서는 MobileShell 생략 */
  embedded?: boolean
  /** 닦기 중 아래 레이어 — intro는 오버레이에서만 재생 */
  suppressIntroAudio?: boolean
  /** 닦기·전환 중 박스 등장 대기 (닦기 완료 후 score-v2에서 1회 재생) */
  deferBoxEnter?: boolean
  /** 닦기 전환 길이 — intro 음성 타이밍용 */
  scoreWipeDurationMs?: number
}

function cardClassName(state: CharacterState) {
  if (state === 'locked') {
    return 'intro-v2-character__card intro-v2-character__card--locked'
  }
  if (state === 'completed') {
    return 'intro-v2-character__card intro-v2-character__card--completed'
  }
  return 'intro-v2-character__card'
}

export function Page4IntroV3({
  onGo,
  onClose,
  isTransitioning,
  embedded,
  suppressIntroAudio,
  deferBoxEnter,
  scoreWipeDurationMs = PAGE_TRANSITION_PUSH_LEFT_MS,
}: Page4IntroV3Props) {
  useEffect(() => {
    if (isTransitioning || suppressIntroAudio) return

    if (embedded) {
      const timer = scheduleScoreIntroVoiceNearWipeEnd(scoreWipeDurationMs)
      return () => window.clearTimeout(timer)
    }

    playScorePageIntroVoice()
  }, [embedded, isTransitioning, scoreWipeDurationMs, suppressIntroAudio])

  const handleGo = () => {
    if (isTransitioning) return
    stopIntroVoice()
    playOpenSfx()
    requestAnimationFrame(() => onGo())
  }

  const content = (
    <section
      className={`page-intro-v2 page-intro-v2--characters-only${deferBoxEnter ? ' page-intro-v2--defer-box-enter' : ''}`}
      aria-label="캐릭터 선택"
    >
      <PageHeader onClose={onClose} />

      <div className="page-intro-v2__body">
        <ul className="page-intro-v2__characters">
          {CHARACTERS.map((character, index) => (
            <li key={character.id} className="intro-v2-character">
              <article
                className={`${cardClassName(character.state)} intro-v2-box-enter${
                  character.id === 'leo' ? ' intro-v2-character__card--lead' : ''
                }`}
                style={{
                  '--enter-order': index,
                  ...(character.state === 'locked' ||
                  character.state === 'completed' ||
                  character.id === 'leo'
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
                {character.state === 'completed' && (
                  <img
                    className="intro-v2-character__good"
                    src={ASSETS.goodBadge}
                    alt="Good!"
                  />
                )}
                {character.state === 'locked' && (
                  <img
                    className="intro-v2-character__lock"
                    src={ASSETS.lock}
                    alt="잠김"
                  />
                )}
                {character.state === 'active' && (
                  <Pressable
                    variant="cta"
                    className="intro-v2-character__start pressable--no-hover"
                    aria-label="시작하기"
                    disabled={isTransitioning}
                    onClick={handleGo}
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
  )

  if (embedded) return content

  return <MobileShell>{content}</MobileShell>
}
