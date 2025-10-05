import { useState } from 'react'
import { useActivityStore } from '../store/useActivityStore'
import { Activity as ActivityIcon, Filter, User, DollarSign, CheckSquare, Package, Briefcase, Users, Mail, LogIn } from 'lucide-react'
import { format } from 'date-fns'

const ActivityLog = () => {
  const { activities } = useActivityStore()
  const [filterType, setFilterType] = useState<string>('all')
  const [filterAction, setFilterAction] = useState<string>('all')

  const filteredActivities = activities.filter((activity) => {
    const matchesType = filterType === 'all' || activity.type === filterType
    const matchesAction = filterAction === 'all' || activity.action === filterAction
    return matchesType && matchesAction
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <Users className="text-blue-600" size={20} />
      case 'deal':
        return <DollarSign className="text-green-600" size={20} />
      case 'task':
        return <CheckSquare className="text-orange-600" size={20} />
      case 'product':
        return <Package className="text-purple-600" size={20} />
      case 'service':
        return <Briefcase className="text-pink-600" size={20} />
      case 'email':
        return <Mail className="text-indigo-600" size={20} />
      case 'login':
        return <LogIn className="text-gray-600" size={20} />
      default:
        return <ActivityIcon className="text-gray-600" size={20} />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'customer':
        return 'bg-blue-50 border-blue-200'
      case 'deal':
        return 'bg-green-50 border-green-200'
      case 'task':
        return 'bg-orange-50 border-orange-200'
      case 'product':
        return 'bg-purple-50 border-purple-200'
      case 'service':
        return 'bg-pink-50 border-pink-200'
      case 'email':
        return 'bg-indigo-50 border-indigo-200'
      case 'login':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-gray-50 border-gray-200'
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
      case 'sent':
        return 'נשלח'
      case 'logged_in':
        return 'התחבר'
      default:
        return action
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'customer':
        return 'לקוח'
      case 'deal':
        return 'עסקה'
      case 'task':
        return 'משימה'
      case 'product':
        return 'מוצר'
      case 'service':
        return 'שירות'
      case 'email':
        return 'אימייל'
      case 'login':
        return 'התחברות'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">יומן פעילות</h1>
        <p className="text-gray-600 mt-1">מעקב אחר כל הפעילויות במערכת</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סנן לפי סוג
            </label>
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">הכל</option>
                <option value="customer">לקוחות</option>
                <option value="deal">עסקאות</option>
                <option value="task">משימות</option>
                <option value="product">מוצרים</option>
                <option value="service">שירותים</option>
                <option value="email">אימיילים</option>
                <option value="login">התחברויות</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סנן לפי פעולה
            </label>
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">הכל</option>
                <option value="created">נוצר</option>
                <option value="updated">עודכן</option>
                <option value="deleted">נמחק</option>
                <option value="sent">נשלח</option>
                <option value="logged_in">התחבר</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-3xl font-bold text-blue-600">{activities.length}</p>
          <p className="text-sm text-gray-600 mt-1">סה"כ פעילויות</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-3xl font-bold text-green-600">
            {activities.filter((a) => a.action === 'created').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">נוצרו</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-3xl font-bold text-orange-600">
            {activities.filter((a) => a.action === 'updated').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">עודכנו</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-3xl font-bold text-indigo-600">
            {activities.filter((a) => a.type === 'email').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">אימיילים</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">
            פעילויות אחרונות ({filteredActivities.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <ActivityIcon size={48} className="mx-auto mb-4 opacity-30" />
              <p>אין פעילויות להצגה</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 hover:bg-gray-50 transition-colors border-r-4 ${getActivityColor(
                  activity.type
                )}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {getTypeLabel(activity.type)} {getActionLabel(activity.action)}
                          {activity.entityName && `: ${activity.entityName}`}
                        </p>
                        {activity.details && (
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.details}
                          </p>
                        )}
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="text-xs text-gray-500">
                          {format(new Date(activity.timestamp), 'dd/MM/yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(activity.timestamp), 'HH:mm')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <User size={14} className="text-gray-400" />
                      <p className="text-xs text-gray-500">{activity.userName}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivityLog
