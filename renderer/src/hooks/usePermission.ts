import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import type { PermissionName } from '../../../shared/types/permissions'

/**
 * Hook to check if current user has a specific permission
 */
export function usePermission(permission: PermissionName): boolean {
  const { sessionToken, permissions } = useAuthStore()
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (!sessionToken || !permissions) {
      setHasPermission(false)
      return
    }

    setHasPermission(permissions.includes(permission))
  }, [sessionToken, permissions, permission])

  return hasPermission
}

/**
 * Hook to check if current user has any of the specified permissions
 */
export function useAnyPermission(permissionList: PermissionName[]): boolean {
  const { sessionToken, permissions } = useAuthStore()
  const [hasAny, setHasAny] = useState(false)

  useEffect(() => {
    if (!sessionToken || !permissions) {
      setHasAny(false)
      return
    }

    setHasAny(permissionList.some(p => permissions.includes(p)))
  }, [sessionToken, permissions, permissionList])

  return hasAny
}

/**
 * Hook to check if current user has all of the specified permissions
 */
export function useAllPermissions(permissionList: PermissionName[]): boolean {
  const { sessionToken, permissions } = useAuthStore()
  const [hasAll, setHasAll] = useState(false)

  useEffect(() => {
    if (!sessionToken || !permissions) {
      setHasAll(false)
      return
    }

    setHasAll(permissionList.every(p => permissions.includes(p)))
  }, [sessionToken, permissions, permissionList])

  return hasAll
}

/**
 * Hook to get all user permissions
 */
export function usePermissions(): string[] {
  const { permissions } = useAuthStore()
  return permissions || []
}
