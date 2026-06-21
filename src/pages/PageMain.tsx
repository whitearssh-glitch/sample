import { MobileShell } from '../components/MobileShell'
import { Pressable } from '../components/Pressable'

type PageMainProps = {
  onStartVer1: () => void
  onStartVer2: () => void
  isTransitioning?: boolean
}

export function PageMain({
  onStartVer1,
  onStartVer2,
  isTransitioning,
}: PageMainProps) {
  return (
    <MobileShell>
      <section className="page-main" aria-label="버전 선택">
        <div className="page-main__buttons">
          <Pressable
            variant="cta"
            className="page-main__button"
            onClick={onStartVer1}
            disabled={isTransitioning}
          >
            ver 1
          </Pressable>
          <Pressable
            variant="cta"
            className="page-main__button page-main__button--secondary"
            onClick={onStartVer2}
            disabled={isTransitioning}
          >
            ver 2
          </Pressable>
        </div>
      </section>
    </MobileShell>
  )
}
