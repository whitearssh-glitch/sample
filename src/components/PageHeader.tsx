import { Pressable } from './Pressable'

const HEADER_ASSETS = {
  close: '/assets/close.png',
  program: '/assets/program.png',
} as const

type PageHeaderProps = {
  onClose: () => void
  className?: string
}

export function PageHeader({ onClose, className }: PageHeaderProps) {
  return (
    <header className={className ? `page-header ${className}` : 'page-header'}>
      <Pressable
        variant="icon"
        className="page-header__close"
        aria-label="닫기"
        onClick={onClose}
      >
        <img src={HEADER_ASSETS.close} alt="" />
      </Pressable>
      <div className="page-header__program">
        <img src={HEADER_ASSETS.program} alt="Basic 01 Day 01" />
      </div>
    </header>
  )
}
