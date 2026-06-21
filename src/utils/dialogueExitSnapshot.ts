import type { CSSProperties } from 'react'
import type { AppTrack } from '../types/pages'

export type DialogueExitSnapshot = {
  sectionClass: string
  voiceStyle: CSSProperties | undefined
  popupOpen: boolean
}

const snapshots: Record<AppTrack, DialogueExitSnapshot | null> = {
  ver1: null,
  ver2: null,
}

export function captureDialogueExitSnapshot(
  value: DialogueExitSnapshot,
  track: AppTrack = 'ver1',
) {
  snapshots[track] = value
}

export function consumeDialogueExitSnapshot(
  track: AppTrack = 'ver1',
): DialogueExitSnapshot | null {
  const value = snapshots[track]
  snapshots[track] = null
  return value
}

export function clearDialogueExitSnapshot(track?: AppTrack) {
  if (track) {
    snapshots[track] = null
    return
  }
  snapshots.ver1 = null
  snapshots.ver2 = null
}
