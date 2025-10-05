import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'user' | 'viewer'
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access
  if (requiredRole) {
    const roleHierarchy = { admin: 3, user: 2, viewer: 1 }
    const userRoleLevel = roleHierarchy[user.role]
    const requiredRoleLevel = roleHierarchy[requiredRole]

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">403</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              אין לך הרשאה
            </h2>
            <p className="text-gray-600">
              אין לך הרשאה לגשת לדף זה. נדרשת הרשאת {requiredRole === 'admin' ? 'מנהל' : 'משתמש'}.
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
