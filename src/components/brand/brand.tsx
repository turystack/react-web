import { tv } from 'tailwind-variants'

import { cn } from '@/support/utils'

import type { BrandProps } from './brand.types'

const styles = tv({
  compoundVariants: [
    {
      class: {
        title: 'text-base',
      },
      size: 'sm',
      variant: 'auth',
    },
    {
      class: {
        title: 'text-lg',
      },
      size: 'md',
      variant: 'auth',
    },
    {
      class: {
        title: 'text-xl',
      },
      size: 'lg',
      variant: 'auth',
    },
  ],
  defaultVariants: {
    size: 'md',
    text: 'visible',
    variant: 'sidebar',
  },
  slots: {
    logo: 'brand-logo shrink-0 object-cover',
    root: 'brand-root min-w-0',
    subtitle: 'brand-subtitle',
    textWrapper: 'brand-text min-w-0',
    title: 'brand-title',
  },
  variants: {
    size: {
      lg: {
        logo: 'size-12',
        subtitle: 'text-sm',
        title: 'text-base',
      },
      md: {
        logo: 'size-10',
        subtitle: 'text-xs',
        title: 'text-sm',
      },
      sm: {
        logo: 'size-8',
        subtitle: 'text-[0.6875rem]',
        title: 'text-xs',
      },
    },
    text: {
      hidden: {
        textWrapper: 'hidden',
      },
      responsive: {
        textWrapper: 'group-data-[collapsible=icon]:hidden',
      },
      visible: '',
    },
    variant: {
      auth: {
        logo: 'rounded-xl',
        root: 'flex flex-col items-center gap-3 text-center',
        subtitle: 'text-muted-foreground',
        textWrapper: 'grid gap-1',
        title: 'font-bold',
      },
      sidebar: {
        logo: 'rounded-xl',
        root: [
          'flex items-center gap-2 px-1 py-1.5',
          'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
        ],
        subtitle: 'truncate text-muted-foreground',
        textWrapper: 'grid flex-1 text-left text-sm leading-tight',
        title: 'truncate font-semibold',
      },
    },
  },
})

function Brand({
  alt = '',
  className,
  logo: logoContent,
  logoClassName,
  size,
  subtitle,
  text,
  title,
  variant,
  ...props
}: BrandProps) {
  const {
    root,
    logo,
    textWrapper,
    title: titleClass,
    subtitle: subtitleClass,
  } = styles({
    size,
    text,
    variant,
  })
  const hasText = Boolean(title || subtitle)

  return (
    <div
      className={root({
        className,
      })}
      data-testid="brand-root"
      {...props}
    >
      {typeof logoContent === 'string' ? (
        <img
          alt={alt}
          className={cn(logo(), logoClassName)}
          data-testid="brand-logo"
          src={logoContent}
        />
      ) : (
        (logoContent ?? (
          <span
            aria-hidden="true"
            className={cn(
              logo(),
              'grid place-items-center bg-primary font-bold text-primary-foreground',
              logoClassName,
            )}
            data-testid="brand-logo"
          >
            T
          </span>
        ))
      )}
      {hasText && text !== 'hidden' && (
        <div className={textWrapper()} data-testid="brand-text">
          {title && <span className={titleClass()}>{title}</span>}
          {subtitle && <span className={subtitleClass()}>{subtitle}</span>}
        </div>
      )}
    </div>
  )
}

export { Brand }
