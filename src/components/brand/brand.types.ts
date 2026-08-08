import type React from 'react'

export type BrandVariant = 'auth' | 'sidebar'

export type BrandText = 'hidden' | 'responsive' | 'visible'

export type BrandSize = 'lg' | 'md' | 'sm'

export type BrandProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  alt?: string
  logo?: React.ReactNode | string
  logoClassName?: string
  size?: BrandSize
  subtitle?: React.ReactNode
  text?: BrandText
  title?: React.ReactNode
  variant?: BrandVariant
}
