import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Deals from './pages/Deals'
import Tasks from './pages/Tasks'
import Products from './pages/Products'
import Services from './pages/Services'
import Reports from './pages/Reports'
import ActivityLog from './pages/ActivityLog'
import Settings from './pages/Settings'
import TeamManagement from './pages/TeamManagement'
import ActivityFeed from './pages/ActivityFeed'
import TeamPerformance from './pages/TeamPerformance'
import { useAuthStore } from './store/useAuthStore'
import { useStore } from './store/useStore'

function App() {
  const { isAuthenticated, initializeAuth, user } = useAuthStore()
  const loadAllData = useStore((state) => state.loadAllData)

  // Initialize Supabase auth on app load
  useEffect(() => {
    const init = async () => {
      console.log('🔷 [App] Initializing auth...')
      await initializeAuth()
      console.log('🔷 [App] Auth initialization complete')
    }
    init()
  }, [initializeAuth])

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Loading data for user:', user.email)
      loadAllData()
    }
  }, [isAuthenticated, user, loadAllData])

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/activity" element={<ActivityLog />} />
                  <Route path="/team" element={<TeamManagement />} />
                  <Route path="/team/activity" element={<ActivityFeed />} />
                  <Route path="/team/performance" element={<TeamPerformance />} />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
