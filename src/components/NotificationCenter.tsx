import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Bell, X, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns'

interface Notification {
  id: string
  type: 'task_due' | 'task_overdue' | 'deal_closing' | 'success' | 'warning'
  title: string
  message: string
  timestamp: Date
  read: boolean
  relatedId?: string
}

const NotificationCenter = () => {
  const { tasks, deals, customers } = useStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Generate notifications from tasks and deals
  useEffect(() => {
    const newNotifications: Notification[] = []

    // Task notifications
    tasks.forEach((task) => {
      if (task.status === 'completed') return

      const dueDate = new Date(task.dueDate)
      const customer = customers.find((c) => c.id === task.customerId)

      if (isPast(dueDate) && !isToday(dueDate)) {
        newNotifications.push({
          id: `task-overdue-${task.id}`,
          type: 'task_overdue',
          title: 'משימה באיחור!',
          message: `"${task.title}" ${customer ? `עבור ${customer.name}` : ''} - באיחור של ${Math.abs(differenceInDays(dueDate, new Date()))} ימים`,
          timestamp: dueDate,
          read: false,
          relatedId: task.id,
        })
      } else if (isToday(dueDate)) {
        newNotifications.push({
          id: `task-today-${task.id}`,
          type: 'task_due',
          title: 'משימה להיום!',
          message: `"${task.title}" ${customer ? `עבור ${customer.name}` : ''} - מתוזמנת להיום`,
          timestamp: dueDate,
          read: false,
          relatedId: task.id,
        })
      } else if (isTomorrow(dueDate)) {
        newNotifications.push({
          id: `task-tomorrow-${task.id}`,
          type: 'task_due',
          title: 'משימה מחר',
          message: `"${task.title}" ${customer ? `עבור ${customer.name}` : ''} - מתוזמנת למחר`,
          timestamp: dueDate,
          read: false,
          relatedId: task.id,
        })
      }
    })

    // Deal closing soon notifications
    deals.forEach((deal) => {
      if (deal.stage === 'won' || deal.stage === 'lost') return

      const closeDate = new Date(deal.expectedCloseDate)
      const customer = customers.find((c) => c.id === deal.customerId)
      const daysUntilClose = differenceInDays(closeDate, new Date())

      if (daysUntilClose <= 7 && daysUntilClose >= 0) {
        newNotifications.push({
          id: `deal-closing-${deal.id}`,
          type: 'deal_closing',
          title: 'עסקה מתקרבת לסגירה',
          message: `"${deal.title}" ${customer ? `עם ${customer.name}` : ''} - צפויה להסגר בעוד ${daysUntilClose} ימים`,
          timestamp: closeDate,
          read: false,
          relatedId: deal.id,
        })
      }
    })

    // Sort by timestamp (newest first)
    newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setNotifications(newNotifications)
    setUnreadCount(newNotifications.filter((n) => !n.read).length)
  }, [tasks, deals, customers])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const removeNotification = (id: string) => {
    const notification = notifications.find((n) => n.id === id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_overdue':
        return <AlertCircle className="text-red-500" size={20} />
      case 'task_due':
        return <Calendar className="text-blue-500" size={20} />
      case 'deal_closing':
        return <CheckCircle className="text-green-500" size={20} />
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} />
      default:
        return <Bell className="text-gray-500" size={20} />
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">התראות</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  סמן הכל כנקרא
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-4 opacity-30" />
                  <p>אין התראות חדשות</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800 text-sm">
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>

                          <p className="text-xs text-gray-400">
                            {format(notification.timestamp, 'dd/MM/yyyy HH:mm')}
                          </p>

                          {!notification.read && (
                            <div className="mt-2">
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationCenter
