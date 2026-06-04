import { useEffect } from 'react'
import { MobileShell } from '../components/MobileShell'
import { PageHeader } from '../components/PageHeader'
import { Pressable } from '../components/Pressable'
import {
  playOpenSfx,
  playScorePageIntroVoice,
  scheduleScoreIntroVoiceNearWipeEnd,
  stopIntroVoice,
} from '../utils/pageAudio'

const ASSETS = {
  background: '/assets/background-james.png',
  characterFrame: '/assets/character-frame.png',
  characterName: '/assets/character-name-james.png',
  characterPicture: '/assets/character-picture-james.png',
  goButton: '/assets/button-go.png',
} as const

type Page4IntroProps = {
  onGo: () => void
  onClose: () => void
  isTransitioning?: boolean
  /** 닦기 오버레이 안에서는 MobileShell 생략 */
  embedded?: boolean
}

export function Page4Intro({
  onGo,
  onClose,
  isTransitioning,
  embedded,
}: Page4IntroProps) {
  useEffect(() => {
    if (isTransitioning) return

    if (embedded) {
      const timer = scheduleScoreIntroVoiceNearWipeEnd()
      return () => window.clearTimeout(timer)
    }

    playScorePageIntroVoice()
  }, [embedded, isTransitioning])

  const handleGo = () => {
    if (isTransitioning) return
    stopIntroVoice()
    playOpenSfx()
    onGo()
  }

  const content = (
      <section className="page-intro page-intro--solo" aria-label="제임스 소개">
        <img
          className="page-intro__bg"
          src={ASSETS.background}
          alt=""
          aria-hidden
        />

        <PageHeader className="page-header--light" onClose={onClose} />

        <div className="page-intro__body">
          <div className="page-intro__character">
            <div className="character-card">
              <img
                className="character-card__picture"
                src={ASSETS.characterPicture}
                alt="James 캐릭터"
              />
              <img
                className="character-card__name"
                src={ASSETS.characterName}
                alt="James"
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
                  aria-label="Go"
                  disabled={isTransitioning}
                  onClick={handleGo}
                >
                  <img src={ASSETS.goButton} alt="Go!" />
                </Pressable>
              </div>
            </div>
          </div>
        </div>
      </section>
  )

  return embedded ? content : <MobileShell>{content}</MobileShell>
}
