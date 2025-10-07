import toast from 'react-hot-toast'

// Success messages
export const showSuccess = (message: string) => {
  return toast.success(message, {
    duration: 3000,
    style: {
      background: '#10b981',
      color: '#fff',
    },
  })
}

// Error messages
export const showError = (message: string) => {
  return toast.error(message, {
    duration: 4000,
    style: {
      background: '#ef4444',
      color: '#fff',
    },
  })
}

// Info messages
export const showInfo = (message: string) => {
  return toast(message, {
    duration: 3000,
    icon: 'ℹ️',
  })
}

// Loading messages
export const showLoading = (message: string) => {
  return toast.loading(message)
}

// Promise-based toast (for async operations)
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string
    error: string
  }
) => {
  return toast.promise(promise, messages)
}

// Confirm dialog replacement
export const showConfirm = async (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast((t) => (
      <div className="flex flex-col gap-3" dir="rtl">
        <p className="text-gray-800 font-medium">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id)
              resolve(false)
            }}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ביטול
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              resolve(true)
            }}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            אישור
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        maxWidth: '400px',
      },
    })
  })
}

// Specific CRM messages
export const crmToast = {
  // Customer messages
  customerCreated: () => showSuccess('✅ לקוח נוצר בהצלחה!'),
  customerUpdated: () => showSuccess('✅ לקוח עודכן בהצלחה!'),
  customerDeleted: () => showSuccess('🗑️ לקוח נמחק בהצלחה!'),

  // Deal messages
  dealCreated: () => showSuccess('✅ עסקה נוצרה בהצלחה!'),
  dealUpdated: () => showSuccess('✅ עסקה עודכנה בהצלחה!'),
  dealDeleted: () => showSuccess('🗑️ עסקה נמחקה בהצלחה!'),

  // Task messages
  taskCreated: () => showSuccess('✅ משימה נוצרה בהצלחה!'),
  taskUpdated: () => showSuccess('✅ משימה עודכנה בהצלחה!'),
  taskDeleted: () => showSuccess('🗑️ משימה נמחקה בהצלחה!'),
  taskCompleted: () => showSuccess('🎉 משימה הושלמה!'),

  // Product/Service messages
  productCreated: () => showSuccess('✅ מוצר נוצר בהצלחה!'),
  productUpdated: () => showSuccess('✅ מוצר עודכן בהצלחה!'),
  productDeleted: () => showSuccess('🗑️ מוצר נמחק בהצלחה!'),
  serviceCreated: () => showSuccess('✅ שירות נוצר בהצלחה!'),
  serviceUpdated: () => showSuccess('✅ שירות עודכן בהצלחה!'),
  serviceDeleted: () => showSuccess('🗑️ שירות נמחק בהצלחה!'),

  // User/Team messages
  userCreated: () => showSuccess('✅ משתמש נוצר בהצלחה!'),
  userUpdated: () => showSuccess('✅ משתמש עודכן בהצלחה!'),
  userDeleted: () => showSuccess('🗑️ משתמש נמחק בהצלחה!'),
  passwordReset: () => showSuccess('🔑 סיסמה אופסה בהצלחה! נשלח אימייל למשתמש.'),

  // Export/Import messages
  exportSuccess: (type: string) => showSuccess(`📥 ${type} יוצא בהצלחה!`),
  importSuccess: (count: number) => showSuccess(`📤 ${count} רשומות יובאו בהצלחה!`),

  // Email messages
  emailSent: () => showSuccess('✉️ האימייל נשלח בהצלחה!'),
  emailFailed: () => showError('❌ שליחת האימייל נכשלה. נסה שוב.'),

  // Error messages
  error: (message?: string) => showError(message || '❌ אופס! משהו השתבש. נסה שוב.'),
  networkError: () => showError('🌐 בעיית רשת. בדוק את החיבור לאינטרנט.'),
  unauthorized: () => showError('🔒 אין לך הרשאה לבצע פעולה זו.'),

  // Loading messages
  saving: () => showLoading('שומר...'),
  loading: () => showLoading('טוען...'),
  deleting: () => showLoading('מוחק...'),
}
