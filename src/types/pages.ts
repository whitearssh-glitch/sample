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

export type AppTrack = 'ver1' | 'ver2'

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

export function isVer2Page(page: PageId): boolean {
  return page.endsWith('-v2')
}

export function trackForPage(page: PageId): AppTrack {
  return isVer2Page(page) ? 'ver2' : 'ver1'
}

export function getFlowOrder(page: PageId): PageId[] | null {
  if (PAGE_ORDER.includes(page)) return PAGE_ORDER
  if (PAGE_ORDER_V2.includes(page)) return PAGE_ORDER_V2
  return null
}

export function getFlowIntro(page: PageId): 'intro' | 'intro-v2' {
  return isVer2Page(page) ? 'intro-v2' : 'intro'
}
