import type { PageId } from '../types/pages'

/** 개발 서버에서만: ?preview=popup | james | james-dialogue | james-popup */
export function getDevInitialPage(): PageId | null {
  if (!import.meta.env.DEV) return null
  const preview = new URLSearchParams(window.location.search).get('preview')
  if (preview === 'popup') return 'dialogue'
  if (preview === 'james') return 'score'
  if (preview === 'james-dialogue' || preview === 'james-popup') return 'hint'
  return null
}

export function isJamesPopupPreview(): boolean {
  if (!import.meta.env.DEV) return false
  return (
    new URLSearchParams(window.location.search).get('preview') === 'james-popup'
  )
}

/** @deprecated use getDevInitialPage */
export function isPopupPreview(): boolean {
  return getDevInitialPage() === 'dialogue'
}
