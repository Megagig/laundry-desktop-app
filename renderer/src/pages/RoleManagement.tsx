import { useState, useEffect } from "react"
import { useAuthStore } from "../store/authStore"
import { usePermission } from "../hooks/usePermission"
import { PERMISSIONS } from "../../../shared/types/permissions"
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "../components/ui"
import { showNotification } from "../utils/notifications"
import { Shield, Users, Eye, Settings, Edit, Save, X } from "lucide-react"

export default function RoleManagement() {
  const { sessionToken } = useAuthStore()
  const [roles, setRoles] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingPermissions, setEditingPermissions] = useState<number[]>([])

  const canManageRoles = usePermission(PERMISSIONS.MANAGE_ROLES)

  useEffect(() => {
    loadRoles()
    loadPermissions()
  }, [])

  const loadRoles = async () => {
    if (!sessionToken) return

    setIsLoading(true)
    try {
      if (window.api?.rbac?.getRoles) {
        const result = await window.api.rbac.getRoles(sessionToken)
        if (result.success) {
          setRoles(result.roles || [])
        } else {
          showNotification({
            type: "error",
            title: "Error",
            message: result.error || "Failed to load roles"
          })
        }
      }
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to load roles"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadPermissions = async () => {
    if (!sessionToken) return

    try {
      if (window.api?.rbac?.getPermissions) {
        const result = await window.api.rbac.getPermissions(sessionToken)
        if (result.success) {
          setPermissions(result.permissions || [])
        }
      }
    } catch (error) {
      console.error('Failed to load permissions:', error)
    }
  }

  const getRolePermissions = (role: any) => {
    if (!role.permissions) return []
    return role.permissions.map((rp: any) => rp.permission)
  }

  const getPermissionsByModule = (rolePermissions: any[]) => {
    const grouped: { [key: string]: any[] } = {}
    rolePermissions.forEach(perm => {
      if (!grouped[perm.module]) {
        grouped[perm.module] = []
      }
      grouped[perm.module].push(perm)
    })
    return grouped
  }

  const startEditing = (role: any) => {
    if (!canManageRoles || role.isSystem) return
    
    setIsEditing(true)
    const rolePermissions = getRolePermissions(role)
    setEditingPermissions(rolePermissions.map((p: any) => p.id))
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditingPermissions([])
  }

  const savePermissions = async () => {
    if (!sessionToken || !selectedRole) return

    try {
      const result = await window.api.rbac.updateRolePermissions(sessionToken, selectedRole.id, editingPermissions)
      if (result.success) {
        showNotification({
          type: "success",
          title: "Success",
          message: "Role permissions updated successfully"
        })
        setIsEditing(false)
        setEditingPermissions([])
        loadRoles()
        // Update selected role
        const updatedRole = roles.find(r => r.id === selectedRole.id)
        if (updatedRole) {
          setSelectedRole(updatedRole)
        }
      } else {
        showNotification({
          type: "error",
          title: "Error",
          message: result.error || "Failed to update permissions"
        })
      }
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to update permissions"
      })
    }
  }

  const togglePermission = (permissionId: number) => {
    setEditingPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading roles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Shield className="text-indigo-600" size={32} />
          Role & Permission Management
        </h1>
        <p className="text-slate-600 mt-2">Manage system roles and their permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Roles List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              System Roles ({roles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roles.map((role) => {
                const rolePermissions = getRolePermissions(role)
                return (
                  <div
                    key={role.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRole?.id === role.id
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-200'
                    }`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{role.name}</h3>
                        <p className="text-sm text-slate-600">{role.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {rolePermissions.length} permissions
                          </Badge>
                          {role.isSystem && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              System Role
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRole(role)
                        }}
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              {selectedRole ? `${selectedRole.name} Permissions` : 'Select a Role'}
              {selectedRole && canManageRoles && !selectedRole.isSystem && (
                <div className="ml-auto flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={savePermissions} className="flex items-center gap-1">
                        <Save size={14} />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing} className="flex items-center gap-1">
                        <X size={14} />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEditing(selectedRole)} className="flex items-center gap-1">
                      <Edit size={14} />
                      Edit
                    </Button>
                  )}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRole ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{selectedRole.name}</h3>
                    <p className="text-sm text-slate-600">{selectedRole.description}</p>
                    {selectedRole.isSystem && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200 mt-1">
                        System Role - Cannot Edit
                      </Badge>
                    )}
                  </div>
                  <Badge>
                    {isEditing ? editingPermissions.length : getRolePermissions(selectedRole).length} permissions
                  </Badge>
                </div>

                {isEditing ? (
                  // Edit Mode - Show all permissions with checkboxes
                  <div className="space-y-4">
                    {Object.entries(
                      permissions.reduce((acc: any, perm: any) => {
                        if (!acc[perm.module]) acc[perm.module] = []
                        acc[perm.module].push(perm)
                        return acc
                      }, {})
                    ).map(([module, perms]: [string, any]) => (
                      <div key={module} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                          <Shield size={16} className="text-indigo-600" />
                          {module}
                          <Badge variant="secondary" className="ml-auto">
                            {perms.filter((p: any) => editingPermissions.includes(p.id)).length}/{perms.length}
                          </Badge>
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {perms.map((perm: any) => (
                            <label key={perm.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingPermissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-mono text-slate-700">{perm.name}</span>
                                <p className="text-xs text-slate-500">{perm.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // View Mode - Show current permissions
                  <div className="space-y-4">
                    {Object.entries(getPermissionsByModule(getRolePermissions(selectedRole))).map(([module, perms]) => (
                      <div key={module} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                          <Shield size={16} className="text-indigo-600" />
                          {module}
                          <Badge variant="secondary" className="ml-auto">
                            {perms.length}
                          </Badge>
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {perms.map((perm: any) => (
                            <div key={perm.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <span className="text-sm font-mono text-slate-700">{perm.name}</span>
                              <span className="text-xs text-slate-500">{perm.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-600">Select a role to view its permissions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Permissions Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>All System Permissions ({permissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              permissions.reduce((acc: any, perm: any) => {
                if (!acc[perm.module]) acc[perm.module] = []
                acc[perm.module].push(perm)
                return acc
              }, {})
            ).map(([module, perms]: [string, any]) => (
              <div key={module} className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                  <Shield size={16} className="text-indigo-600" />
                  {module}
                  <Badge variant="secondary" className="ml-auto">
                    {perms.length}
                  </Badge>
                </h4>
                <div className="space-y-1">
                  {perms.map((perm: any) => (
                    <div key={perm.id} className="text-sm text-slate-600 font-mono">
                      {perm.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}