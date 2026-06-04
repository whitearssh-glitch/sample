export type DialogueVoiceProfile = {
  voiceSrc: string
  responseVoiceSrc: string
}

export const OLIVIA_DIALOGUE_VOICE: DialogueVoiceProfile = {
  voiceSrc: '/olivia.mp3',
  responseVoiceSrc: '/olivia2.mp3',
}

export const JAMES_DIALOGUE_VOICE: DialogueVoiceProfile = {
  voiceSrc: '/james.mp3',
  responseVoiceSrc: '/james2.mp3',
}

/** @deprecated OLIVIA_DIALOGUE_VOICE.voiceSrc 사용 */
export const DIALOGUE_VOICE_SRC = OLIVIA_DIALOGUE_VOICE.voiceSrc

/** 음성 파일 없거나 로드 실패 시 UI 흐름 확인용 (실제 음성 연결 후에는 사용 안 함) */
export const DIALOGUE_VOICE_FALLBACK_MS = 2800

/** 음성 종료 후 할로 자연스럽게 사라지는 시간 */
export const DIALOGUE_HALO_FADE_MS = 550

/** @deprecated OLIVIA_DIALOGUE_VOICE.responseVoiceSrc 사용 */
export const DIALOGUE_RESPONSE_VOICE_SRC = OLIVIA_DIALOGUE_VOICE.responseVoiceSrc

/** 마이크 재클릭 후 olivia2·캐릭터 할로 시작까지 대기 */
export const DIALOGUE_RESPONSE_START_DELAY_MS = 1000

/** 응답 할로 fade-out 완료 후 팝업까지 대기 */
export const DIALOGUE_RESPONSE_POPUP_DELAY_MS = 800
