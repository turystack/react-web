import { DataTransferRecords } from '@/components/data-transfer/data-transfer.records'
import type { DataTransferRecordsProps } from '@/components/data-transfer/data-transfer.types'

/** The rows of an export: a `succeeded` row is one written to the file. */
export function DataTransferExportRecords<T>(
  props: DataTransferRecordsProps<T>,
) {
  return <DataTransferRecords<T> {...props} direction="export" />
}
