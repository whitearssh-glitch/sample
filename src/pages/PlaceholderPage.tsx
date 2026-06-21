import { MobileShell } from '../components/MobileShell'
import { Pressable } from '../components/Pressable'
import type { PageId } from '../types/pages'

type PlaceholderPageProps = {
  pageId: PageId
  onBack: () => void
}

const PAGE_LABELS: Record<Exclude<PageId, 'intro' | 'intro-v2' | 'intro-v3' | 'main'>, string> = {
  dialogue: '2. 대화 화면',
  score: '4. 제임스 인트로',
  hint: '5. 제임스 대화',
  popup: '6. 팝업',
  complete: '7. 완료 화면',
  'dialogue-v2': 'ver2 · 2. 대화 화면',
  'score-v2': 'ver2 · 4. 제임스 인트로',
  'hint-v2': 'ver2 · 5. 제임스 대화',
  'popup-v2': 'ver2 · 6. 팝업',
  'complete-v2': 'ver2 · 7. 완료 화면',
  'dialogue-v3': 'ver3 · 2. 대화 화면',
  'score-v3': 'ver3 · 4. 제임스 인트로',
  'hint-v3': 'ver3 · 5. 제임스 대화',
  'popup-v3': 'ver3 · 6. 팝업',
  'complete-v3': 'ver3 · 7. 완료 화면',
}

export function PlaceholderPage({ pageId, onBack }: PlaceholderPageProps) {
  const label =
    pageId === 'main'
      ? '시작 화면'
      : pageId === 'intro'
        ? '시작 화면'
        : pageId === 'intro-v2'
          ? 'ver2 · 1. 시작 화면'
          : pageId === 'intro-v3'
            ? 'ver3 · 1. 시작 화면'
            : PAGE_LABELS[pageId]

  return (
    <MobileShell>
      <div className="placeholder-page">
        <p className="placeholder-page__label">{label}</p>
        <p className="placeholder-page__hint">
          시안을 보내주시면 이 화면을 구현할게요.
        </p>
        <Pressable variant="cta" className="placeholder-page__back" onClick={onBack}>
          이전 화면
        </Pressable>
      </div>
    </MobileShell>
  )
}
