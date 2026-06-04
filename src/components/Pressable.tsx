import type { ButtonHTMLAttributes, ReactNode } from 'react'

type PressableProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  className?: string
  variant?: 'icon' | 'chip' | 'cta'
}

export function Pressable({
  children,
  className = '',
  variant = 'icon',
  type = 'button',
  ...props
}: PressableProps) {
  return (
    <button
      type={type}
      className={`pressable pressable--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
