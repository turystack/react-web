import type { ReactNode } from 'react'

/** The space an Identity occupies in its parent surface. */
export type IdentityVariant = 'table' | 'compact' | 'default' | 'header'

/** The component's own density; deliberately independent from Avatar size. */
export type IdentitySize = 'sm' | 'md' | 'lg'

export type IdentityProps = {
  /** Avatar, thumbnail, icon, or other visual representation of the entity. */
  media?: ReactNode
  /** The entity's primary human-readable name. */
  title: ReactNode
  /** Content below the title: document, price, status, SKU, or any domain detail. */
  description?: ReactNode
  /** An inline action beside the title, such as a menu or redirect link. */
  action?: ReactNode
  /** The surface in which the identity is being used. */
  variant?: IdentityVariant
  /** The component density, independent of its supplied media. */
  size?: IdentitySize
}
