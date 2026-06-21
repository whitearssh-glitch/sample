import type { AppTrack } from '../types/pages'
import { resetJamesPopupEntranceSfx, resetOliviaPopupEntranceSfx } from './pageAudio'

export type DialoguePopupKind = 'olivia' | 'james'

const entrancePlayed: Record<AppTrack, Record<DialoguePopupKind, boolean>> = {
  ver1: { olivia: false, james: false },
  ver2: { olivia: false, james: false },
}

export function hasDialoguePopupEntrancePlayed(
  kind: DialoguePopupKind = 'olivia',
  track: AppTrack = 'ver1',
): boolean {
  return entrancePlayed[track][kind]
}

export function markDialoguePopupEntrancePlayed(
  kind: DialoguePopupKind = 'olivia',
  track: AppTrack = 'ver1',
): void {
  entrancePlayed[track][kind] = true
}

export function resetDialoguePopupSession(
  kind?: DialoguePopupKind,
  track?: AppTrack,
): void {
  if (track && kind) {
    entrancePlayed[track][kind] = false
    if (kind === 'olivia') resetOliviaPopupEntranceSfx()
    if (kind === 'james') resetJamesPopupEntranceSfx()
    return
  }
  if (track) {
    entrancePlayed[track].olivia = false
    entrancePlayed[track].james = false
    resetOliviaPopupEntranceSfx()
    resetJamesPopupEntranceSfx()
    return
  }
  if (kind) {
    entrancePlayed.ver1[kind] = false
    entrancePlayed.ver2[kind] = false
    if (kind === 'olivia') resetOliviaPopupEntranceSfx()
    if (kind === 'james') resetJamesPopupEntranceSfx()
    return
  }
  entrancePlayed.ver1.olivia = false
  entrancePlayed.ver1.james = false
  entrancePlayed.ver2.olivia = false
  entrancePlayed.ver2.james = false
  resetOliviaPopupEntranceSfx()
  resetJamesPopupEntranceSfx()
}
