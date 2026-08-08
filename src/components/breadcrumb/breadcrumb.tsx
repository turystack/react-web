import {
  cloneElement,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
} from 'react'
import { tv } from 'tailwind-variants'
import { ChevronRight, MoreHorizontal } from '@/internal/icons'

import type { BreadcrumbLinkProps } from './breadcrumb.types'

const breadcrumb = tv({
  slots: {
    ellipsis:
      'breadcrumb-ellipsis flex size-5 items-center justify-center [&>svg]:size-4',
    item: 'breadcrumb-item inline-flex items-center gap-1',
    link: 'breadcrumb-link transition-colors hover:text-foreground',
    list: 'breadcrumb-list flex flex-wrap items-center gap-1.5 break-words text-muted-foreground text-sm',
    page: 'breadcrumb-page font-normal text-foreground',
    root: 'breadcrumb-root',
    separator: 'breadcrumb-separator [&>svg]:size-3.5',
  },
})

const { root, list, item, link, page, separator, ellipsis } = breadcrumb()

function BreadcrumbRoot({ children }: PropsWithChildren) {
  return (
    <nav
      aria-label="breadcrumb"
      className={root()}
      data-testid="breadcrumb-root"
    >
      {children}
    </nav>
  )
}

function BreadcrumbList({ children }: PropsWithChildren) {
  return (
    <ol className={list()} data-testid="breadcrumb-list">
      {children}
    </ol>
  )
}

function BreadcrumbItem({ children }: PropsWithChildren) {
  return (
    <li className={item()} data-testid="breadcrumb-item">
      {children}
    </li>
  )
}

function BreadcrumbLink({
  asChild,
  href,
  children,
}: PropsWithChildren<BreadcrumbLinkProps>) {
  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      className: link(),
      'data-testid': 'breadcrumb-link',
    })
  }

  return (
    <a className={link()} data-testid="breadcrumb-link" href={href}>
      {children}
    </a>
  )
}

function BreadcrumbPage({ children }: PropsWithChildren) {
  return (
    <span aria-current="page" className={page()} data-testid="breadcrumb-page">
      {children}
    </span>
  )
}

function BreadcrumbSeparator({ children }: PropsWithChildren) {
  return (
    <li
      aria-hidden="true"
      className={separator()}
      data-testid="breadcrumb-separator"
      role="presentation"
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

function BreadcrumbEllipsis() {
  return (
    <span
      aria-hidden="true"
      className={ellipsis()}
      data-testid="breadcrumb-ellipsis"
      role="presentation"
    >
      <MoreHorizontal />
      <span className="sr-only">More</span>
    </span>
  )
}

const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Ellipsis: BreadcrumbEllipsis,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  List: BreadcrumbList,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
})

export { Breadcrumb }
