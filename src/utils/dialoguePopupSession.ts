import { resetJamesPopupEntranceSfx, resetOliviaPopupEntranceSfx } from './pageAudio'

export type DialoguePopupKind = 'olivia' | 'james'

const entrancePlayed: Record<DialoguePopupKind, boolean> = {
  olivia: false,
  james: false,
}

export function hasDialoguePopupEntrancePlayed(
  kind: DialoguePopupKind = 'olivia',
): boolean {
  return entrancePlayed[kind]
}

export function markDialoguePopupEntrancePlayed(
  kind: DialoguePopupKind = 'olivia',
): void {
  entrancePlayed[kind] = true
}

export function resetDialoguePopupSession(kind?: DialoguePopupKind): void {
  if (kind) {
    entrancePlayed[kind] = false
    if (kind === 'olivia') resetOliviaPopupEntranceSfx()
    if (kind === 'james') resetJamesPopupEntranceSfx()
    return
  }
  entrancePlayed.olivia = false
  entrancePlayed.james = false
  resetOliviaPopupEntranceSfx()
  resetJamesPopupEntranceSfx()
}
