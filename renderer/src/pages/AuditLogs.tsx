import { useState, useEffect } from "react"
import { useAuthStore } from "../store/authStore"
import { usePermission } from "../hooks/usePermission"
import { PERMISSIONS } from "../../../shared/types/permissions"
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input } from "../components/ui"
import { showNotification } from "../utils/notifications"
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  Activity,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface AuditLogEntry {
  id: number
  userId: number | null
  username: string | null
  action: string
  module: string
  description: string | null
  metadata: string | null
  ipAddress: string | null
  createdAt: string
  user?: {
    id: number
    fullName: string
    email: string
    username: string
  } | null
}

interface AuditLogFilters {
  userId?: number
  module?: string
  action?: string
  startDate?: string
  endDate?: string
  searchTerm?: string
  limit?: number
  offset?: number
}

export default function AuditLogs() {
  const { sessionToken } = useAuthStore()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [users, setUsers] = useState<any[]>([])
  const [modules, setModules] = useState<string[]>([])
  const [actions, setActions] = useState<string[]>([])
  
  const logsPerPage = 50
  
  const [filters, setFilters] = useState<AuditLogFilters>({
    limit: logsPerPage,
    offset: 0
  })

  const canViewAuditLogs = usePermission(PERMISSIONS.VIEW_AUDIT_LOGS)
  const canExportAuditLogs = usePermission(PERMISSIONS.EXPORT_AUDIT_LOGS)

  useEffect(() => {
    if (canViewAuditLogs) {
      loadAuditLogs()
      loadFilterOptions()
    }
  }, [canViewAuditLogs, filters])

  const loadAuditLogs = async () => {
    if (!sessionToken) return

    setIsLoading(true)
    try {
      const result = await window.api.audit.getLogs(sessionToken, filters)
      if (result.success) {
        setLogs(result.data || [])
        
        // Get total count for pagination
        const countResult = await window.api.audit.getLogCount(sessionToken, filters)
        if (countResult.success) {
          setTotalLogs(countResult.data || 0)
        }
      } else {
        showNotification({
          type: "error",
          title: "Error",
          message: result.error || "Failed to load audit logs"
        })
      }
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to load audit logs"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    if (!sessionToken) return

    try {
      // Load users for filter
      if (window.api?.user?.getAll) {
        const usersResult = await window.api.user.getAll(sessionToken)
        if (usersResult.success) {
          setUsers(usersResult.data || [])
        }
      }

      // Load unique modules
      const modulesResult = await window.api.audit.getUniqueModules(sessionToken)
      if (modulesResult.success) {
        setModules(modulesResult.data || [])
      }

      // Load unique actions
      const actionsResult = await window.api.audit.getUniqueActions(sessionToken)
      if (actionsResult.success) {
        setActions(actionsResult.data || [])
      }
    } catch (error) {
      console.error('Failed to load filter options:', error)
    }
  }

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: searchTerm || undefined,
      offset: 0
    }))
    setCurrentPage(1)
  }

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      offset: 0
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      limit: logsPerPage,
      offset: 0
    })
    setCurrentPage(1)
  }

  const handleExport = async () => {
    if (!sessionToken) return

    try {
      const result = await window.api.audit.exportLogs(sessionToken, filters)
      if (result.success) {
        showNotification({
          type: "success",
          title: "Export Successful",
          message: `Audit logs exported to: ${result.data}`
        })
      } else {
        showNotification({
          type: "error",
          title: "Export Failed",
          message: result.error || "Failed to export audit logs"
        })
      }
    } catch (error) {
      showNotification({
        type: "error",
        title: "Export Failed",
        message: "Failed to export audit logs"
      })
    }
  }

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * logsPerPage
    setFilters(prev => ({
      ...prev,
      offset: newOffset
    }))
    setCurrentPage(page)
  }

  const viewLogDetails = (log: AuditLogEntry) => {
    setSelectedLog(log)
    setShowDetails(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-700 border-green-200'
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-700 border-blue-200'
    if (action.includes('DELETE')) return 'bg-red-100 text-red-700 border-red-200'
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-700 border-purple-200'
    if (action.includes('PERMISSION_DENIED')) return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const totalPages = Math.ceil(totalLogs / logsPerPage)

  if (!canViewAuditLogs) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-600">You don't have permission to view audit logs</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="text-indigo-600" size={32} />
            Audit Logs
          </h1>
          <p className="text-slate-600 mt-2">Monitor all system activities and user actions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter size={18} />
            Filters
          </Button>
          {canExportAuditLogs && (
            <Button
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </Button>
          )}
          <Button
            variant="outline"
            onClick={loadAuditLogs}
            className="flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Search audit logs..."
            className="pl-10"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <select
                  value={filters.userId || ''}
                  onChange={(e) => handleFilterChange('userId', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Users</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module
                </label>
                <select
                  value={filters.module || ''}
                  onChange={(e) => handleFilterChange('module', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Modules</option>
                  {modules.map(module => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <select
                  value={filters.action || ''}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  {actions.map(action => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Audit Log Entries ({totalLogs.toLocaleString()})</span>
            <div className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors cursor-pointer"
                  onClick={() => viewLogDetails(log)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-slate-400" />
                      <Badge className={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{log.module}</span>
                        {log.user && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <User size={14} />
                            <span>{log.user.fullName}</span>
                          </div>
                        )}
                      </div>
                      {log.description && (
                        <p className="text-sm text-slate-600 truncate max-w-md">
                          {log.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar size={14} />
                        <span>{formatDate(log.createdAt)}</span>
                      </div>
                      {log.ipAddress && (
                        <p className="text-xs text-slate-400 mt-1">
                          IP: {log.ipAddress}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Eye size={16} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-600">No audit logs found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, totalLogs)} of {totalLogs} entries
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Audit Log Details</h2>
              <Button
                variant="ghost"
                onClick={() => setShowDetails(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Log ID
                  </label>
                  <p className="text-sm text-gray-900">{selectedLog.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timestamp
                  </label>
                  <p className="text-sm text-gray-900">{formatDate(selectedLog.createdAt)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedLog.user ? `${selectedLog.user.fullName} (${selectedLog.user.username})` : selectedLog.username || 'System'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IP Address
                  </label>
                  <p className="text-sm text-gray-900">{selectedLog.ipAddress || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module
                  </label>
                  <Badge className="text-sm">{selectedLog.module}</Badge>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action
                  </label>
                  <Badge className={getActionBadgeColor(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </div>
              </div>
              
              {selectedLog.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedLog.description}
                  </p>
                </div>
              )}
              
              {selectedLog.metadata && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metadata
                  </label>
                  <pre className="text-xs text-gray-900 bg-gray-50 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowDetails(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}