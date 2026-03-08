import { Table, Pagination, Text } from "@mantine/core"
import { useState } from "react"
import LoadingSpinner from "./LoadingSpinner"
import EmptyState from "./EmptyState"

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  emptyMessage?: string
  itemsPerPage?: number
  onRowClick?: (item: T) => void
  keyExtractor: (item: T) => string | number
}

export default function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data available",
  itemsPerPage = 10,
  onRowClick,
  keyExtractor
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <Table highlightOnHover={!!onRowClick} striped>
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th 
                  key={column.key}
                  style={{ width: column.width }}
                >
                  {column.label}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {currentData.map((item) => (
              <Table.Tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? "cursor-pointer" : ""}
              >
                {columns.map((column) => (
                  <Table.Td key={column.key}>
                    {column.render 
                      ? column.render(item) 
                      : String((item as any)[column.key] || "-")
                    }
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Text size="sm" c="dimmed">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
          </Text>
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={setCurrentPage}
            size="sm"
          />
        </div>
      )}
    </div>
  )
}
