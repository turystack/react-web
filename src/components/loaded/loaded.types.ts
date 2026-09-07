/**
 * Loaded
 *
 * Renders its children once a read landed, and the reason why not until then.
 *
 * Behavior:
 * - Takes the five states of a remote read as one value and decides between
 *   them in the canonical order: pending, denied, error, empty, success. The
 *   order is the component's, not the caller's, because a denial that lands
 *   after the generic error branch is swallowed by it
 * - Children are a function and receive the data, so there is no way to reach
 *   it before the read succeeded
 * - Each state has an override slot; without one, it falls back to an
 *   EmptyState built from the labels, and the error state carries a retry
 * - The denied state carries the reason and no retry, because retrying a
 *   denial changes nothing
 * - Valid content stays on screen under a LoadingOverlay while the read
 *   refreshes, rather than being replaced by a skeleton
 * - This is the region format. A Table, a List and a Select take the same
 *   value directly; Loaded is for a panel, a card or a section, which are
 *   none of the three
 *
 * Implementation:
 * - Sibling of Protected: same shape, a different question. Protected asks
 *   whether the user may see it, Loaded asks whether it arrived
 * - <Loaded outcome={outcome}>{(contract) => <ContractSummary contract={contract} />}</Loaded>
 * - <Loaded emptySection={<EmptyState title="No bookings yet" />} outcome={outcome}>{render}</Loaded>
 *
 * Dependencies: EmptyState component, Button component, Skeleton component,
 * LoadingOverlay component, @turystack/react-hooks (DataOutcome)
 */

import type { DataOutcome } from '@turystack/react-hooks'
import type { ReactNode } from 'react'

import type { EmptyStateSize } from '@/components/empty-state'

export type LoadedProps<T> = {
  children: (data: T) => ReactNode // renders only once the read succeeded
  deniedSection?: ReactNode // replaces the reason card of a denied read
  emptySection?: ReactNode // replaces the card shown when the read is empty
  errorSection?: ReactNode // replaces the card shown when the read failed
  loadingRows?: number // skeleton blocks drawn while pending; default 3
  loadingSection?: ReactNode // replaces the skeleton shown while pending
  outcome: DataOutcome<T> // the five states of a remote read
  size?: EmptyStateSize // how much room the state cards take; default md
}
