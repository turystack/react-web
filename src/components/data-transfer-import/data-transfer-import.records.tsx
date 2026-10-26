import { DataTransferRecords } from '@/components/data-transfer/data-transfer.records'
import type { DataTransferRecordsProps } from '@/components/data-transfer/data-transfer.types'

/** The rows of an import: a `succeeded` row is one the resource took in. */
export function DataTransferImportRecords<T>(
  props: DataTransferRecordsProps<T>,
) {
  return <DataTransferRecords<T> {...props} direction="import" />
}
