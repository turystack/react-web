import { tv } from 'tailwind-variants'

/** The records list's slots, shared by the import's and the export's. */
export const styles = tv({
  slots: {
    error: 'data-transfer-error',
    errors:
      'data-transfer-errors flex flex-col gap-0.5 whitespace-normal break-words text-destructive text-xs',
    failure: 'data-transfer-failure text-destructive text-sm',
    job: 'data-transfer-job flex flex-col gap-1.5',
    jobCounts: 'data-transfer-job-counts text-muted-foreground text-sm',
    jobLine: 'data-transfer-job-line flex flex-wrap items-center gap-2',
    records: 'data-transfer-records flex min-w-0 flex-col gap-3',
    status: 'data-transfer-status flex flex-col items-start gap-1',
    value: 'data-transfer-value block truncate',
  },
})
