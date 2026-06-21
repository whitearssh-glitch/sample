export type PageId =
  | 'main'
  | 'intro'
  | 'dialogue'
  | 'hint'
  | 'score'
  | 'popup'
  | 'complete'
  | 'intro-v2'
  | 'dialogue-v2'
  | 'hint-v2'
  | 'score-v2'
  | 'popup-v2'
  | 'complete-v2'
  | 'intro-v3'
  | 'dialogue-v3'
  | 'hint-v3'
  | 'score-v3'
  | 'popup-v3'
  | 'complete-v3'

export type AppTrack = 'ver1' | 'ver2' | 'ver3'

export const PAGE_ORDER: PageId[] = [
  'intro',
  'dialogue',
  'score',
  'hint',
  'popup',
  'complete',
]

export const PAGE_ORDER_V2: PageId[] = [
  'intro-v2',
  'dialogue-v2',
  'score-v2',
  'hint-v2',
  'popup-v2',
  'complete-v2',
]

export const PAGE_ORDER_V3: PageId[] = [
  'intro-v3',
  'dialogue-v3',
  'score-v3',
  'hint-v3',
  'popup-v3',
  'complete-v3',
]

export function isVer2Page(page: PageId): boolean {
  return page.endsWith('-v2')
}

export function isVer3Page(page: PageId): boolean {
  return page.endsWith('-v3')
}

export function trackForPage(page: PageId): AppTrack {
  if (isVer3Page(page)) return 'ver3'
  if (isVer2Page(page)) return 'ver2'
  return 'ver1'
}

export function getFlowOrder(page: PageId): PageId[] | null {
  if (PAGE_ORDER.includes(page)) return PAGE_ORDER
  if (PAGE_ORDER_V2.includes(page)) return PAGE_ORDER_V2
  if (PAGE_ORDER_V3.includes(page)) return PAGE_ORDER_V3
  return null
}

export function getFlowIntro(page: PageId): 'intro' | 'intro-v2' | 'intro-v3' {
  if (isVer3Page(page)) return 'intro-v3'
  if (isVer2Page(page)) return 'intro-v2'
  return 'intro'
}
