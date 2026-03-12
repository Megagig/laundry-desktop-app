import type { ReactNode } from 'react'
import { usePermission, useAnyPermission, useAllPermissions } from '../../hooks/usePermission'
import type { PermissionName } from '../../../../shared/types/permissions'

interface ProtectedComponentProps {
  children: ReactNode
  permission?: PermissionName
  anyPermissions?: PermissionName[]
  allPermissions?: PermissionName[]
  fallback?: ReactNode
}

/**
 * Component that conditionally renders children based on user permissions
 */
export default function ProtectedComponent({
  children,
  permission,
  anyPermissions,
  allPermissions,
  fallback = null
}: ProtectedComponentProps) {
  const hasSinglePermission = usePermission(permission!)
  const hasAny = useAnyPermission(anyPermissions || [])
  const hasAll = useAllPermissions(allPermissions || [])

  // Determine if user has required permissions
  let hasAccess = false

  if (permission) {
    hasAccess = hasSinglePermission
  } else if (anyPermissions && anyPermissions.length > 0) {
    hasAccess = hasAny
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAll
  } else {
    // No permissions specified, allow access
    hasAccess = true
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
