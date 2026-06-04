import type { CSSProperties } from 'react'

export type DialogueExitSnapshot = {
  sectionClass: string
  voiceStyle: CSSProperties | undefined
  popupOpen: boolean
}

let snapshot: DialogueExitSnapshot | null = null

export function captureDialogueExitSnapshot(value: DialogueExitSnapshot) {
  snapshot = value
}

export function consumeDialogueExitSnapshot(): DialogueExitSnapshot | null {
  const value = snapshot
  snapshot = null
  return value
}

export function clearDialogueExitSnapshot() {
  snapshot = null
}
