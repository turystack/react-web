/**
 * Avatar
 *
 * User profile image with automatic fallback when the image fails to load.
 * Renders initials or a placeholder icon when no image is available.
 *
 * Behavior:
 * - Attempts to load src image; on error, renders fallback slot
 * - Size variants control dimensions: sm (28px), md (36px), lg (48px)
 * - Shape variants: circle (rounded-full) or square (rounded-md)
 * - Image fills container with object-cover and aspect-square
 *
 * Implementation:
 * - Use Radix UI Avatar (Root + Image + Fallback) for loading state management
 * - tailwind-variants (tv) for size/variant styling
 * - <Avatar src="/photo.jpg" alt="User" size="md" variant="circle" />
 *
 * Dependencies: @radix-ui/react-avatar
 */

export type AvatarSize = 'sm' | 'md' | 'lg'

export type AvatarVariant = 'circle' | 'square'

export type AvatarProps = {
  src?: string | null // image URL
  alt?: string // alt text for the image
  size?: AvatarSize // controls rendered dimensions
  variant?: AvatarVariant // circle or square shape via border-radius
}
