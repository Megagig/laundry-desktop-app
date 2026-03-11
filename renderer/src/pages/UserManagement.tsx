import { useState, useEffect } from "react"
import { useAuthStore } from "../store/authStore"
import { usePermission } from "../hooks/usePermission"
import { PERMISSIONS } from "../../../shared/types/permissions"
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "../components/ui"
import { showNotification } from "../utils/notifications"
import { Shield, UserPlus, Edit, Trash2, Lock, CheckCircle, XCircle } from "lucide-react"
import type { User } from "../../../shared/types/auth.types"

export default function UserManagement() {
  const { sessionToken } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [createFormData, setCreateFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: 1
  })
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    roleId: 1
  })
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [roles, setRoles] = useState<any[]>([])

  const canCreateUser = usePermission(PERMISSIONS.CREATE_USER)
  const canEditUser = usePermission(PERMISSIONS.EDIT_USER)
  const canDeleteUser = usePermission(PERMISSIONS.DELETE_USER)
  const canResetPassword = usePermission(PERMISSIONS.RESET_USER_PASSWORD)

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadRoles = async () => {
    if (!sessionToken) return
    
    try {
      if (window.api?.rbac?.getRoles) {
        const result = await window.api.rbac.getRoles(sessionToken)
        if (result.success) {
          setRoles(result.roles || [])
        }
      }
    } catch (error) {
      console.error('Failed to load roles:', error)
    }
  }

  const handleAddUser = () => {
    setShowCreateForm(true)
    setCreateFormData({
      username: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleId: roles.find(r => r.name === 'CASHIER')?.id || 1
    })
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId
    })
    setShowEditForm(true)
  }

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!sessionToken) return

    // Validation
    if (createFormData.password !== createFormData.confirmPassword) {
      showNotification({
        type: "error",
        title: "Validation Error",
        message: "Passwords do not match"
      })
      return
    }

    if (createFormData.password.length < 8) {
      showNotification({
        type: "error",
        title: "Validation Error",
        message: "Password must be at least 8 characters long"
      })
      return
    }

    try {
      const result = await window.api.user.create(sessionToken, {
        username: createFormData.username,
        fullName: createFormData.fullName,
        email: createFormData.email,
        password: createFormData.password,
        roleId: createFormData.roleId
      })

      if (result.success) {
        showNotification({
          type: "success",
          title: "Success",
          message: "User created successfully"
        })
        setShowCreateForm(false)
        loadUsers()
      } else {
        showNotification({
          type: "error",
          title: "Error",
          message: result.error || "Failed to create user"
        })
      }
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to create user"
      })
    }
  }

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!sessionToken || !editingUser) return

    try {
      const result = await window.api.user.update(sessionToken, editingUser.id, {
        fullName: editFormData.fullName,
        email: editFormData.email,
        roleId: editFormData.roleId
      })

      if (result.success) {
        showNotification({
          type: "success",
          title: "Success",
          message: "User updated successfully"
        })
        setShowEditForm(false)
        setEditingUser(null)
        loadUsers()
      } else {
        showNotification({
          type: "error",
          title: "Error",
          message: result.error || "Failed to update user"
        })
      }
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to update user"
      })
    }
  }

  const loadUsers = async () => {
    if (!sessionToken) {
      console.log('No session token available for loading users')
      return
    }

    setIsLoading(true)
    try {
      if (!window.api?.user?.getAll) {
        console.error('User API not available')
        setUsers([])
        showNotification({
          type: "error",
          title: "Error",
          message: "User API not available"
        })
        return
      }
      
      const result = await window.api.user.getAll(sessionToken)
      
      if (result.success) {
        const userData = result.users || result.data || []
        setUsers(userData)
      } else {
        setUsers([])
        showNotification({
          type: "error",
          title: "Error",
          message: result.error || "Failed to load users"
        })
      }
    } catch (error) {
      setUsers([])
      console.error('Error loading users:', error)
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to load users"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (userId: number) => {
    if (!sessionToken) return

    try {
      const result = await window.api.user.toggleActive(sessionToken, userId)
      if (result.success) {
        showNotification({
          type: "success",
          title: "Success",
          message: "User status updated"
        })
        loadUsers()
      } else {
        showNotification({
          type: "error",
          title: "Error",
          message: result.error || "Failed to update user"
        })
      }
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to update user"
      })
    }
  }

  const handleResetPassword = (user: User) => {
    setResetPasswordUser(user)
    setResetPasswordData({
      newPassword: '',
      confirmPassword: ''
    })
    setShowResetPassword(true)
  }

  const handleResetPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!sessionToken || !resetPasswordUser) return

    // Validation
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      showNotification({
        type: "error",
        title: "Validation Error",
        message: "Passwords do not match"
      })
      return
    }

    if (resetPasswordData.newPassword.length < 8) {
      showNotification({
        type: "error",
        title: "Validation Error",
        message: "Password must be at least 8 characters long"
      })
      return
    }

    try {
      const result = await window.api.user.resetPassword(sessionToken, resetPasswordUser.id, resetPasswordData.newPassword)
      if (result.success) {
        showNotification({
          type: "success",
          title: "Success",
          message: "Password reset successfully"
        })
        setShowResetPassword(false)
        setResetPasswordUser(null)
        setResetPasswordData({ newPassword: '', confirmPassword: '' })
      } else {
        showNotification({
          type: "error",
          title: "Error",
          message: result.error || "Failed to reset password"
        })
      }
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to reset password"
      })
    }
  }

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return
    if (!sessionToken) return

    try {
      const result = await window.api.user.delete(sessionToken, userId)
      if (result.success) {
        showNotification({
          type: "success",
          title: "Success",
          message: "User deleted successfully"
        })
        loadUsers()
      } else {
        showNotification({
          type: "error",
          title: "Error",
          message: result.error || "Failed to delete user"
        })
      }
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to delete user"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading users...</p>
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
            User Management
          </h1>
          <p className="text-slate-600 mt-2">Manage system users and their roles</p>
        </div>
        {canCreateUser && (
          <Button 
            className="flex items-center gap-2"
            onClick={handleAddUser}
          >
            <UserPlus size={18} />
            Add User
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users ({users?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users && users.length > 0 ? users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Shield className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{user.fullName}</h3>
                      {user.isActive ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle size={12} className="mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          <XCircle size={12} className="mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{user.email}</p>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium">Username:</span> {user.username} • 
                      <span className="font-medium ml-2">Role:</span> {user.role?.name || "No Role"}
                    </p>
                    {user.lastLoginAt && (
                      <p className="text-xs text-slate-400 mt-1">
                        Last login: {new Date(user.lastLoginAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canEditUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(user.id)}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                  {canResetPassword && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleResetPassword(user)}
                    >
                      <Lock size={14} />
                      Reset Password
                    </Button>
                  )}
                  {canEditUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit size={14} />
                      Edit
                    </Button>
                  )}
                  {canDeleteUser && user.username !== "admin" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(user.id, user.fullName)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <Shield className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-600">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={createFormData.username}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={createFormData.fullName}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={createFormData.roleId}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, roleId: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password (min 8 characters)"
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={createFormData.confirmPassword}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm password"
                  minLength={8}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditForm && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Edit User: {editingUser.fullName}</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={editingUser.username}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editFormData.roleId}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, roleId: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingUser(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Update User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && resetPasswordUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Reset Password: {resetPasswordUser.fullName}</h2>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password (min 8 characters)"
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                  minLength={8}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> The user will need to use this new password for their next login.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowResetPassword(false)
                    setResetPasswordUser(null)
                    setResetPasswordData({ newPassword: '', confirmPassword: '' })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Reset Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
