import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import { Breadcrumb } from '@/components/breadcrumb'

import type {
  PageContentProps,
  PageHeaderProps,
  PageProps,
  PageToolbarProps,
} from './page.types'

const styles = tv({
  slots: {
    content: 'page-content flex min-w-0 flex-col gap-4',
    header: 'page-header flex min-w-0 flex-col gap-3',
    // The identity and the action are two blocks, not a row of five things.
    // `items-start` rather than `items-center`, because a two-line description
    // would otherwise drag a one-line button down to the middle of it.
    headerMain:
      'page-header-main flex min-w-0 items-start justify-between gap-4',
    headerAction: 'page-header-action flex shrink-0 items-center gap-2',
    headerDescription: 'page-header-description text-muted-foreground text-sm',
    headerIcon: [
      'page-header-icon flex size-10 shrink-0 items-center justify-center rounded-lg',
      'bg-muted text-foreground [&_svg]:size-5 [&_svg]:shrink-0',
    ],
    headerIdentity: 'page-header-identity flex min-w-0 items-center gap-3',
    headerText: 'page-header-text flex min-w-0 flex-col gap-1',
    headerTitle:
      'page-header-title truncate font-semibold text-xl tracking-tight',
    root: 'page-root flex min-w-0 flex-col gap-6',
    toolbar: 'page-toolbar flex min-w-0 flex-col gap-3',
  },
})

const {
  content: contentClass,
  header: headerClass,
  headerAction: headerActionClass,
  headerDescription: headerDescriptionClass,
  headerIcon: headerIconClass,
  headerIdentity: headerIdentityClass,
  headerMain: headerMainClass,
  headerText: headerTextClass,
  headerTitle: headerTitleClass,
  root: rootClass,
  toolbar: toolbarClass,
} = styles()

function PageRoot({ children }: PropsWithChildren<PageProps>) {
  return (
    <div className={rootClass()} data-testid="page-root">
      {children}
    </div>
  )
}

function PageHeader({
  action,
  breadcrumbs,
  description,
  icon,
  title,
}: PageHeaderProps) {
  return (
    <div className={headerClass()} data-testid="page-header">
      {breadcrumbs === undefined || breadcrumbs.length === 0 ? null : (
        <Breadcrumb>
          <Breadcrumb.List>
            {breadcrumbs.map((crumb, index) => {
              // The last step is where the reader already is, so it is a page
              // rather than a link — an anchor to here is a control that does
              // nothing, and assistive tech announces it as one.
              const isCurrent = index === breadcrumbs.length - 1

              return (
                <Breadcrumb.Item key={crumb.href ?? String(crumb.label)}>
                  {isCurrent || crumb.href === undefined ? (
                    <Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
                  ) : (
                    <>
                      <Breadcrumb.Link href={crumb.href}>
                        {crumb.label}
                      </Breadcrumb.Link>
                      <Breadcrumb.Separator />
                    </>
                  )}
                </Breadcrumb.Item>
              )
            })}
          </Breadcrumb.List>
        </Breadcrumb>
      )}

      <div className={headerMainClass()} data-testid="page-header-main">
        <div className={headerIdentityClass()}>
          {icon === undefined ? null : (
            <span className={headerIconClass()} data-slot="page-header-icon">
              {icon}
            </span>
          )}
          <span className={headerTextClass()}>
            <h1 className={headerTitleClass()}>{title}</h1>
            {description === undefined ? null : (
              <p className={headerDescriptionClass()}>{description}</p>
            )}
          </span>
        </div>

        {action === undefined ? null : (
          <div className={headerActionClass()} data-testid="page-header-action">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

function PageToolbar({ children }: PropsWithChildren<PageToolbarProps>) {
  return (
    <div className={toolbarClass()} data-testid="page-toolbar">
      {children}
    </div>
  )
}

function PageContent({ children }: PropsWithChildren<PageContentProps>) {
  return (
    <div className={contentClass()} data-testid="page-content">
      {children}
    </div>
  )
}

const Page = Object.assign(PageRoot, {
  Content: PageContent,
  Header: PageHeader,
  Toolbar: PageToolbar,
})

export { Page }
