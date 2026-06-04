/**
 * score-ribbon.png — 제임스 팝업 별 3개 (가로 균등 배치)
 */
export const JAMES_DIALOGUE_POPUP_RIBBON = {
  width: 2385,
  height: 740,
  starAspectRatio: 408 / 429,
  slots: [
    { centerLeftPercent: 30.8, centerTopPercent: 34.5, widthPercent: 16.8 },
    { centerLeftPercent: 50, centerTopPercent: 34.5, widthPercent: 16.8 },
    { centerLeftPercent: 69, centerTopPercent: 34.5, widthPercent: 16.8 },
  ] as const,
  starScale: 1.02,
} as const

/** Super · 컨페티 · 리본 · 별 타이밍 */
export const JAMES_DIALOGUE_POPUP_ENTRANCE = {
  /** 팝업 UI 등장 */
  openSfxSrc: '/popup2.mp3',
  /** Super 스탬프 (--title-stamp-delay) */
  sfxSrc: '/fb1.mp3',
  sfxDelayMs: 100,
  confettiDelayMs: 0,
  superDelayMs: 100,
  ribbonStickDelayMs: 220,
  starDelayMs: [500, 660, 820] as const,
} as const
