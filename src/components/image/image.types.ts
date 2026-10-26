/**
 * Image
 *
 * Media on a product screen — a store banner, an album cover, a product shot,
 * a logo — framed by a declared ratio, fit and corner, with a stand-in when
 * the file is missing or broken.
 *
 * Behavior:
 * - `alt` is required by the type. Describe what the image shows; pass
 *   `alt=""` only for a decorative image (a banner repeating the heading next
 *   to it), which is then hidden from assistive technology — broken or not
 * - `ratio` fixes the frame's shape before the file arrives, so the page does
 *   not jump: square, 4/3, 16/9, 3/2, 21/9, or auto (default) for the file's
 *   own proportions. `fit` decides how the file meets that shape: cover
 *   (default, crops to fill) or contain (letterboxes, nothing cropped)
 * - `width` full (default) spans the container; auto keeps the file's own
 *   width, never wider than the container
 * - `rounded` is the corner radius (default md); `bordered` draws a hairline
 *   around the frame
 * - `loading` is lazy by default, so offscreen media costs nothing until
 *   scrolled to; eager is for the one image above the fold
 * - When `src` is empty or fails to load, `fallback` takes the image's place
 *   on a muted surface of the same ratio (default: an image icon), edged by
 *   an inset hairline so it still reads on a muted card. The frame
 *   keeps the image's name (`role="img"` + `alt`), since it stands in for it.
 *   A new `src` tries again. With ratio auto the stand-in is 4/3, and with
 *   width auto it is 10rem wide, because a missing file has no size to borrow
 *
 * Implementation:
 * - A native `<img>` with `decoding="async"`; the load error is state keyed
 *   by the failing `src`, so changing `src` retries without an effect
 * - <Image alt="Blue sneaker, side view" ratio="square" src={shot} />
 * - <Image alt="" ratio="21/9" rounded="none" src={banner} width="full" />
 * - <Image alt="Store logo" fallback={<Initials name={store} />} fit="contain" ratio="square" src={logo} width="auto" />
 *
 * Dependencies: @turystack/react-icons (ImageIcon for the default fallback)
 */

export type ImageRatio = 'square' | '4/3' | '16/9' | '3/2' | '21/9' | 'auto'

export type ImageFit = 'cover' | 'contain'

export type ImageRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type ImageWidth = 'auto' | 'full'

export type ImageLoading = 'lazy' | 'eager'

export type ImageProps = {
  src: string // the file's URL; empty shows the fallback
  alt: string // what the image shows (required); "" marks it decorative
  ratio?: ImageRatio // frame shape; default auto (the file's own)
  fit?: ImageFit // how the file meets the frame; default cover
  rounded?: ImageRounded // corner radius; default md
  width?: ImageWidth // full (default) spans the container, auto keeps the file's width
  loading?: ImageLoading // lazy (default) or eager for above-the-fold media
  fallback?: React.ReactNode // stands in when src is empty or fails; default an image icon
  bordered?: boolean // hairline around the frame; default false
}
