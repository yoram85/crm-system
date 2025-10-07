import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { UserPlus, AlertCircle, Mail } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { register, signInWithGoogle, signInWithFacebook, isAuthenticated } = useAuthStore();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות לא תואמות');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      setIsLoading(false);
      return;
    }

    try {
      const success = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      if (!success) {
        setError('שגיאה בהרשמה. נסה שוב.');
        setIsLoading(false);
      }
    } catch (err: any) {
      const errorMessage = err?.message || '';

      // Handle rate limiting error
      if (errorMessage.includes('after 25 seconds') || errorMessage.includes('Too Many Requests')) {
        setError('⏱️ יותר מדי ניסיונות. אנא המתן 25 שניות ונסה שוב.');
      } else if (errorMessage.includes('already registered')) {
        setError('המייל כבר רשום במערכת. נסה להתחבר במקום.');
      } else {
        setError(`שגיאה בהרשמה: ${errorMessage || 'נסה שוב'}`);
      }

      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(`שגיאה בהרשמה עם Google: ${err?.message || 'נסה שוב'}`);
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      await signInWithFacebook();
    } catch (err: any) {
      setError(`שגיאה בהרשמה עם Facebook: ${err?.message || 'נסה שוב'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">הרשמה למערכת CRM</h1>
          <p className="text-gray-600">צור חשבון חדש</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 mb-6">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Email/Password Form */}
          {showEmailForm ? (
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  שם פרטי
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input-field w-full"
                  placeholder="שם פרטי"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  שם משפחה
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input-field w-full"
                  placeholder="שם משפחה"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  אימייל
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field w-full"
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  סיסמה
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field w-full"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  אימות סיסמה
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input-field w-full"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? 'נרשם...' : 'הירשם'}
              </button>

              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                חזור לאפשרויות הרשמה
              </button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  יש לך כבר חשבון?{' '}
                  <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                    התחבר כאן
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {/* Email/Password Button */}
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Mail size={20} />
                <span className="text-lg">הירשם עם אימייל</span>
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">או</span>
                </div>
              </div>

              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-lg">הירשם עם Google</span>
              </button>

              {/* Facebook Sign Up Button */}
              <button
                type="button"
                onClick={handleFacebookSignIn}
                disabled={isLoading}
                className="w-full bg-[#1877F2] text-white py-4 rounded-lg font-medium hover:bg-[#166FE5] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-lg">הירשם עם Facebook</span>
              </button>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  יש לך כבר חשבון?{' '}
                  <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                    התחבר כאן
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
