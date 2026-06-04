/**
 * score-ribbon.png (2385×740) — lum<177 음각 bbox 기하 중심 + 미세 보정
 * 슬롯 높이: CSS aspect-ratio(408/429), width는 리본 가로 %만 사용
 */
export const DIALOGUE_POPUP_RIBBON = {
  width: 2385,
  height: 740,
  starAspectRatio: 408 / 429,
  slots: [
    {
      centerLeftPercent: 30.59,
      centerTopPercent: 34.5,
      widthPercent: 16.8,
    },
    {
      centerLeftPercent: 49.83,
      centerTopPercent: 34.5,
      widthPercent: 16.8,
    },
  ] as const,
  starScale: 1.02,
} as const

/** 팝업 등장 SFX · Good/리본/별 타이밍 */
export const DIALOGUE_POPUP_ENTRANCE = {
  /** 팝업 UI 등장 */
  openSfxSrc: '/popup.mp3',
  /** 팝업 등장 후 스탬프 효과 (popup.mp3와 겹침) */
  sfxSrc: '/fb2.mp3',
  sfxDelayMs: 200,
  goodDelayMs: 60,
  ribbonStickDelayMs: 180,
  firstStarDelayMs: 640,
  secondStarDelayMs: 820,
} as const
