import { useStore } from '../store/useStore'
import { TeamPerformance as TeamPerformanceType } from '../types'
import { TrendingUp, Target, Award, Users } from 'lucide-react'
import { useMemo } from 'react'

const TeamPerformance = () => {
  const { users, deals, tasks, customers } = useStore()

  const performanceData = useMemo(() => {
    return users.map((user): TeamPerformanceType & { user: typeof user } => {
      const userDeals = deals.filter(d => {
        const customer = customers.find(c => c.id === d.customerId)
        return customer?.id && user.assignedCustomers?.includes(customer.id)
      })

      const userTasks = tasks.filter(t => {
        const customer = customers.find(c => c.id === t.customerId)
        return customer?.id && user.assignedCustomers?.includes(customer.id)
      })

      const userCustomers = customers.filter(c => user.assignedCustomers?.includes(c.id))

      return {
        userId: user.id,
        user,
        deals: {
          total: userDeals.length,
          won: userDeals.filter(d => d.stage === 'won').length,
          lost: userDeals.filter(d => d.stage === 'lost').length,
          value: userDeals.reduce((sum, d) => sum + (d.stage === 'won' ? d.amount : 0), 0),
        },
        tasks: {
          completed: userTasks.filter(t => t.status === 'completed').length,
          pending: userTasks.filter(t => t.status === 'pending').length,
          overdue: userTasks.filter(t => {
            return t.status !== 'completed' && new Date(t.dueDate) < new Date()
          }).length,
        },
        customers: {
          total: userCustomers.length,
          active: userCustomers.filter(c => c.status === 'active').length,
        },
        lastActivityDate: new Date(),
      }
    })
  }, [users, deals, tasks, customers])

  const topPerformers = useMemo(() => {
    return [...performanceData]
      .sort((a, b) => b.deals.value - a.deals.value)
      .slice(0, 5)
  }, [performanceData])

  const totalRevenue = useMemo(() => {
    return performanceData.reduce((sum, p) => sum + p.deals.value, 0)
  }, [performanceData])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ביצועי צוות</h1>
        <p className="text-gray-600 mt-1">
          מעקב אחר ביצועים, יעדים והישגים
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">סה״כ הכנסות</p>
              <p className="text-2xl font-bold text-green-600">
                ₪{totalRevenue.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">עסקאות שנסגרו</p>
              <p className="text-2xl font-bold text-blue-600">
                {performanceData.reduce((sum, p) => sum + p.deals.won, 0)}
              </p>
            </div>
            <Award className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">משימות שהושלמו</p>
              <p className="text-2xl font-bold text-purple-600">
                {performanceData.reduce((sum, p) => sum + p.tasks.completed, 0)}
              </p>
            </div>
            <Target className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">לקוחות מנוהלים</p>
              <p className="text-2xl font-bold text-orange-600">
                {performanceData.reduce((sum, p) => sum + p.customers.total, 0)}
              </p>
            </div>
            <Users className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="text-yellow-500" size={24} />
          מובילי ביצועים
        </h2>

        <div className="space-y-4">
          {topPerformers.map((performer, idx) => (
            <div
              key={performer.userId}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {idx + 1}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {performer.user.firstName} {performer.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{performer.user.department || performer.user.role}</p>
                </div>
              </div>

              <div className="text-left">
                <p className="text-2xl font-bold text-green-600">
                  ₪{performer.deals.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {performer.deals.won} עסקאות • {performer.tasks.completed} משימות
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ביצועים מפורטים</h2>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                משתמש
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                יעד חודשי
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                הכנסות
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                השגת יעד
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                עסקאות
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                משימות
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                לקוחות
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {performanceData.map((perf) => {
              const targetAchievement = perf.user.monthlyTarget
                ? (perf.deals.value / perf.user.monthlyTarget) * 100
                : 0

              return (
                <tr key={perf.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {perf.user.firstName.charAt(0)}{perf.user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {perf.user.firstName} {perf.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {perf.user.department || perf.user.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {perf.user.monthlyTarget ? `₪${perf.user.monthlyTarget.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      ₪{perf.deals.value.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {perf.user.monthlyTarget ? (
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              targetAchievement >= 100
                                ? 'bg-green-500'
                                : targetAchievement >= 70
                                ? 'bg-blue-500'
                                : targetAchievement >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(targetAchievement, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {targetAchievement.toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="font-semibold text-green-600">{perf.deals.won}</span>
                      {' / '}
                      <span className="text-gray-500">{perf.deals.total}</span>
                      {perf.deals.lost > 0 && (
                        <span className="text-red-600"> (-{perf.deals.lost})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="font-semibold text-blue-600">{perf.tasks.completed}</span>
                      {' / '}
                      <span className="text-gray-500">{perf.tasks.completed + perf.tasks.pending}</span>
                      {perf.tasks.overdue > 0 && (
                        <span className="text-red-600"> (!{perf.tasks.overdue})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="font-semibold text-purple-600">{perf.customers.active}</span>
                      {' / '}
                      <span className="text-gray-500">{perf.customers.total}</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {performanceData.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">אין נתוני ביצועים</h3>
            <p className="mt-1 text-sm text-gray-500">הוסף משתמשים והקצה להם לקוחות כדי לראות ביצועים</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamPerformance
