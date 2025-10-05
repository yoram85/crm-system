import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, DollarSign, CheckSquare, Package, Briefcase, FileText, Activity, Settings, Menu, X, LogOut, User as UserIcon } from 'lucide-react'
import NotificationCenter from './NotificationCenter'
import { useAuthStore } from '../store/useAuthStore'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/', icon: Home, label: 'דף הבית' },
    { path: '/customers', icon: Users, label: 'לקוחות' },
    { path: '/deals', icon: DollarSign, label: 'עסקאות' },
    { path: '/tasks', icon: CheckSquare, label: 'משימות' },
    { path: '/products', icon: Package, label: 'מוצרים' },
    { path: '/services', icon: Briefcase, label: 'שירותים' },
    { path: '/reports', icon: FileText, label: 'דוחות' },
    { path: '/activity', icon: Activity, label: 'יומן פעילות' },
    { path: '/settings', icon: Settings, label: 'הגדרות' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-primary-600">מערכת CRM</h1>
            <NotificationCenter />
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-16 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-30 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <UserIcon className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'מנהל' : user?.role === 'user' ? 'משתמש' : 'צופה'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>התנתק</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-20 pb-6 px-4 lg:pr-64 lg:px-6">
        {children}
      </main>
    </div>
  )
}

export default Layout
