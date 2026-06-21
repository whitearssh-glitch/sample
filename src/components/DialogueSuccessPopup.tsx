import { useEffect } from 'react'
import { Pressable } from './Pressable'
import {
  DIALOGUE_POPUP_RIBBON,
  EMMA_DIALOGUE_POPUP_RIBBON,
  DIALOGUE_POPUP_ENTRANCE,
} from '../config/dialoguePopupLayout'
import {
  JAMES_DIALOGUE_POPUP_RIBBON,
  LEO_DIALOGUE_POPUP_RIBBON,
  JAMES_DIALOGUE_POPUP_ENTRANCE,
} from '../config/jamesDialoguePopupLayout'
import { LEO_SUPER_FIREWORKS } from '../config/leoDialoguePopupLayout'
import type { AppTrack } from '../types/pages'
import {
  hasDialoguePopupEntrancePlayed,
  markDialoguePopupEntrancePlayed,
  type DialoguePopupKind,
} from '../utils/dialoguePopupSession'
import {
  playJamesPopupEntranceSfx,
  playOliviaPopupEntranceSfx,
  playOpen2Sfx,
} from '../utils/pageAudio'

const V2 = '/assets/ver2/sources'

const OLIVIA_ASSETS = {
  title: '/assets/score-good.png',
  ribbon: '/assets/score-ribbon.png',
  star: '/assets/score-star.png',
  next: '/assets/button-next.png',
} as const

const EMMA_ASSETS = {
  ...OLIVIA_ASSETS,
  title: `${V2}/score-good.png`,
  ribbon: `${V2}/score-ribbon.png`,
  star: `${V2}/score-star.png`,
  next: `${V2}/button-next.png`,
} as const

const JAMES_ASSETS = {
  sceneBg: '/assets/score-background.png',
  confetti: '/assets/score-confetti.png',
  title: '/assets/score-super.png',
  ribbon: '/assets/score-ribbon.png',
  star: '/assets/score-star.png',
  next: '/assets/button-next.png',
} as const

const LEO_ASSETS = {
  ...JAMES_ASSETS,
  title: `${V2}/score-super.png`,
  ribbon: `${V2}/score-ribbon.png`,
  star: `${V2}/score-star.png`,
  next: `${V2}/button-next.png`,
} as const

type DialogueSuccessPopupProps = {
  variant?: DialoguePopupKind
  track?: AppTrack
  onNext: () => void
}

export function DialogueSuccessPopup({
  variant = 'olivia',
  track = 'ver1',
  onNext,
}: DialogueSuccessPopupProps) {
  const isJames = variant === 'james'
  const isLeo = isJames && track === 'ver2'
  const ribbon = isJames
    ? track === 'ver2'
      ? LEO_DIALOGUE_POPUP_RIBBON
      : JAMES_DIALOGUE_POPUP_RIBBON
    : track === 'ver2'
      ? EMMA_DIALOGUE_POPUP_RIBBON
      : DIALOGUE_POPUP_RIBBON
  const entrance = isJames ? JAMES_DIALOGUE_POPUP_ENTRANCE : DIALOGUE_POPUP_ENTRANCE
  const assets = isJames
    ? track === 'ver2'
      ? LEO_ASSETS
      : JAMES_ASSETS
    : track === 'ver2'
      ? EMMA_ASSETS
      : OLIVIA_ASSETS
  const skipEntrance = hasDialoguePopupEntrancePlayed(variant, track)

  useEffect(() => {
    markDialoguePopupEntrancePlayed(variant, track)
  }, [track, variant])

  useEffect(() => {
    if (skipEntrance) return

    if (!isJames) {
      playOliviaPopupEntranceSfx()
      return
    }

    playJamesPopupEntranceSfx()
  }, [isJames, skipEntrance])

  const ribbonStyle: Record<string, string> = {
    ['--ribbon-w']: String(ribbon.width),
    ['--ribbon-h']: String(ribbon.height),
    ['--star-aspect']: String(ribbon.starAspectRatio),
    ['--star-scale']: String(ribbon.starScale),
    ['--title-stamp-delay']: `${isJames ? JAMES_DIALOGUE_POPUP_ENTRANCE.superDelayMs : DIALOGUE_POPUP_ENTRANCE.goodDelayMs}ms`,
    ['--ribbon-stick-delay']: `${entrance.ribbonStickDelayMs}ms`,
  }

  if (isJames && 'confettiDelayMs' in entrance) {
    ribbonStyle['--confetti-delay'] = `${entrance.confettiDelayMs}ms`
    entrance.starDelayMs.forEach((ms, index) => {
      ribbonStyle[`--star-stamp-delay-${index + 1}`] = `${ms}ms`
    })
  } else {
    ribbonStyle['--star-stamp-delay-1'] = `${DIALOGUE_POPUP_ENTRANCE.firstStarDelayMs}ms`
    ribbonStyle['--star-stamp-delay-2'] = `${DIALOGUE_POPUP_ENTRANCE.secondStarDelayMs}ms`
  }

  const popupClass = [
    'dialogue-popup',
    isJames ? 'dialogue-popup--james' : '',
    !isJames && track === 'ver2' ? 'dialogue-popup--emma' : '',
    isJames && track === 'ver2' ? 'dialogue-popup--leo' : '',
    skipEntrance ? 'dialogue-popup--settled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleNext = () => {
    if (!isJames) playOpen2Sfx()
    onNext()
  }

  return (
    <div
      className={popupClass}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogue-popup-title"
    >
      {isJames && (
        <img
          className="dialogue-popup__scene-bg"
          src={JAMES_ASSETS.sceneBg}
          alt=""
          aria-hidden
        />
      )}

      <div className="dialogue-popup__backdrop" aria-hidden />

      {isJames && !isLeo && (
        <img
          className="dialogue-popup__confetti"
          src={JAMES_ASSETS.confetti}
          alt=""
          aria-hidden
        />
      )}

      <div className="dialogue-popup__content">
        <div className="dialogue-popup__cluster" style={ribbonStyle}>
          <div className="dialogue-popup__title-wrap">
            {isLeo &&
              LEO_SUPER_FIREWORKS.map((firework) => (
                <img
                  key={firework.id}
                  className={`dialogue-popup__firework dialogue-popup__firework--${firework.id} dialogue-popup__firework--glow-${firework.glow}`}
                  src={firework.src}
                  alt=""
                  aria-hidden
                  style={{
                    left: firework.left,
                    top: firework.top,
                    width: `calc(${firework.assetW} / 3333 * min(100vw, 375px) * ${firework.scale})`,
                    animationDelay: `${firework.delayMs}ms`,
                  }}
                />
              ))}
            <img
              id="dialogue-popup-title"
              className="dialogue-popup__title"
              src={assets.title}
              alt={isJames ? 'Super!' : 'Good!'}
            />
          </div>

          <div className="dialogue-popup__stars">
            <img
              className="dialogue-popup__ribbon"
              src={assets.ribbon}
              alt=""
              width={ribbon.width}
              height={ribbon.height}
              aria-hidden
            />
            <div
              className="dialogue-popup__star-layer"
              aria-label={`별 ${ribbon.slots.length}개`}
            >
              {ribbon.slots.map((slot, index) => (
                <div
                  key={index}
                  className={`dialogue-popup__star-slot dialogue-popup__star-slot--${index + 1}`}
                  style={{
                    left: `${slot.centerLeftPercent}%`,
                    top: `${slot.centerTopPercent}%`,
                    width: `${slot.widthPercent}%`,
                  }}
                >
                  <img
                    className={`dialogue-popup__star dialogue-popup__star--stamp-${index + 1}`}
                    src={assets.star}
                    alt=""
                  />
                </div>
              ))}
            </div>
          </div>

          <Pressable
            variant="cta"
            className="dialogue-popup__next pressable--no-hover"
            aria-label="다음"
            onClick={handleNext}
          >
            <img src={assets.next} alt="" />
          </Pressable>
        </div>
      </div>
    </div>
  )
}
