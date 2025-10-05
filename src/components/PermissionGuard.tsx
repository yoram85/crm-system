import { ReactNode } from 'react'
import { useStore } from '../store/useStore'
import { Permission } from '../types'
import { AlertCircle } from 'lucide-react'

interface PermissionGuardProps {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}

export const PermissionGuard = ({ permission, children, fallback }: PermissionGuardProps) => {
  const hasPermission = useStore((state) => state.hasPermission)

  if (!hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="text-yellow-600" size={24} />
        <div>
          <h3 className="font-semibold text-yellow-900">אין הרשאה</h3>
          <p className="text-sm text-yellow-700">אין לך הרשאה לצפות בתוכן זה</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook for permission check
export const usePermission = (permission: Permission): boolean => {
  return useStore((state) => state.hasPermission(permission))
}
