import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(formData.email, formData.password)

      if (success) {
        navigate('/')
      } else {
        setError('אימייל או סיסמה שגויים')
      }
    } catch (err) {
      setError('שגיאה בהתחברות. נסה שוב.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">מערכת CRM</h1>
          <p className="text-gray-600">התחבר לחשבון שלך</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                אימייל
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@domain.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סיסמה
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </button>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-600">
              אין לך חשבון?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                הירשם כעת
              </Link>
            </p>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">חשבונות לדוגמה:</p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="bg-gray-50 p-2 rounded">
                <strong>מנהל:</strong> admin@crm.com / admin123
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>משתמש:</strong> user@crm.com / user123
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>צופה:</strong> viewer@crm.com / viewer123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
