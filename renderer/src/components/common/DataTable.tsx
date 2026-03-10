import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { cn } from "../../lib/utils"
import LoadingSpinner from "./LoadingSpinner"
import EmptyState from "./EmptyState"

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  width?: string
  className?: string
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
    return (
      <Card className="p-8">
        <LoadingSpinner />
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState message={emptyMessage} />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wide",
                      column.className
                    )}
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className={cn(
                    "transition-colors hover:bg-slate-50/50",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-6 py-4 text-sm text-slate-900",
                        column.className
                      )}
                    >
                      {column.render 
                        ? column.render(item) 
                        : (item as any)[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} results
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}