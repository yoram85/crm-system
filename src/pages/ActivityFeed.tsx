import { useStore } from '../store/useStore'
import { Activity as ActivityIcon, User, DollarSign, CheckSquare, Package, Clock } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'

const ActivityFeed = () => {
  const { activities, users, customers } = useStore()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <User className="text-blue-600" size={20} />
      case 'deal':
        return <DollarSign className="text-green-600" size={20} />
      case 'task':
        return <CheckSquare className="text-orange-600" size={20} />
      case 'product':
      case 'service':
        return <Package className="text-purple-600" size={20} />
      case 'user':
        return <User className="text-gray-600" size={20} />
      default:
        return <ActivityIcon className="text-gray-600" size={20} />
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'נוצר'
      case 'updated':
        return 'עודכן'
      case 'deleted':
        return 'נמחק'
      case 'completed':
        return 'הושלם'
      case 'assigned':
        return 'הוקצה'
      default:
        return action
    }
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user ? `${user.firstName} ${user.lastName}` : 'משתמש לא ידוע'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">פיד פעילות</h1>
        <p className="text-gray-600 mt-1">
          מעקב אחר כל הפעילויות במערכת
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">סה״כ פעילויות</p>
              <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
            </div>
            <ActivityIcon className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">היום</p>
              <p className="text-2xl font-bold text-green-600">
                {activities.filter(a => {
                  const today = new Date()
                  const activityDate = new Date(a.timestamp)
                  return activityDate.toDateString() === today.toDateString()
                }).length}
              </p>
            </div>
            <Clock className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">משתמשים פעילים</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(activities.map(a => a.userId)).size}
              </p>
            </div>
            <User className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">עסקאות חדשות</p>
              <p className="text-2xl font-bold text-orange-600">
                {activities.filter(a => a.type === 'deal' && a.action === 'created').length}
              </p>
            </div>
            <DollarSign className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">פעילויות אחרונות</h2>

          {activities.length === 0 ? (
            <div className="text-center py-12">
              <ActivityIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">אין פעילויות</h3>
              <p className="mt-1 text-sm text-gray-500">התחל לעבוד במערכת כדי לראות פעילויות</p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {activities.slice(0, 50).map((activity, idx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {idx !== activities.slice(0, 50).length - 1 && (
                        <span
                          className="absolute top-5 right-5 -mr-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex items-start space-x-3 space-x-reverse">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">
                                {getUserName(activity.userId)}
                              </span>{' '}
                              <span className="text-gray-500">
                                {getActionLabel(activity.action)}
                              </span>{' '}
                              <span className="font-medium text-gray-900">
                                {activity.entityName}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {formatDistanceToNow(new Date(activity.timestamp), {
                                addSuffix: true,
                                locale: he,
                              })}
                            </p>
                          </div>
                          {activity.description && (
                            <div className="mt-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                              {activity.description}
                            </div>
                          )}
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                                >
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {format(new Date(activity.timestamp), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivityFeed
