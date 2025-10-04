import { useStore } from '../store/useStore'
import { Users, DollarSign, CheckSquare, TrendingUp, Calendar } from 'lucide-react'
import { format, isAfter, isBefore, addDays } from 'date-fns'

const Dashboard = () => {
  const { customers, deals, tasks } = useStore()

  // Calculate statistics
  const activeCustomers = customers.filter((c) => c.status === 'active').length
  const activeDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length
  const wonDeals = deals.filter((d) => d.stage === 'won')
  const monthlyRevenue = wonDeals.reduce((sum, deal) => sum + deal.amount, 0)
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length
  const upcomingTasks = tasks.filter(
    (t) =>
      t.status !== 'completed' &&
      isAfter(new Date(t.dueDate), new Date()) &&
      isBefore(new Date(t.dueDate), addDays(new Date(), 7))
  )

  const stats = [
    {
      label: 'סה״כ לקוחות',
      value: customers.length,
      activeValue: activeCustomers,
      icon: Users,
      color: 'bg-blue-500',
      subLabel: 'פעילים',
    },
    {
      label: 'עסקאות פעילות',
      value: activeDeals,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'הכנסות חודשיות',
      value: `₪${monthlyRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      label: 'משימות ממתינות',
      value: pendingTasks,
      icon: CheckSquare,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">דף הבית</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  {stat.activeValue !== undefined && (
                    <p className="text-sm text-gray-500 mt-1">
                      {stat.activeValue} {stat.subLabel}
                    </p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users size={20} />
            לקוחות אחרונים
          </h2>
          {customers.slice(-5).reverse().length > 0 ? (
            <div className="space-y-3">
              {customers
                .slice(-5)
                .reverse()
                .map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        customer.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : customer.status === 'lead'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {customer.status === 'active'
                        ? 'פעיל'
                        : customer.status === 'lead'
                        ? 'ליד'
                        : 'לא פעיל'}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">אין לקוחות עדיין</p>
          )}
        </div>

        {/* Active Deals */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            עסקאות פעילות
          </h2>
          {deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length > 0 ? (
            <div className="space-y-3">
              {deals
                .filter((d) => d.stage !== 'won' && d.stage !== 'lost')
                .slice(-5)
                .reverse()
                .map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{deal.title}</p>
                      <p className="text-sm text-gray-600">
                        ₪{deal.amount.toLocaleString()} • {deal.probability}%
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        deal.stage === 'negotiation'
                          ? 'bg-yellow-100 text-yellow-800'
                          : deal.stage === 'proposal'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {deal.stage === 'negotiation'
                        ? 'משא ומתן'
                        : deal.stage === 'proposal'
                        ? 'הצעת מחיר'
                        : 'ליד'}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">אין עסקאות פעילות</p>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar size={20} />
            משימות קרובות (7 ימים הקרובים)
          </h2>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {task.priority === 'high'
                        ? 'גבוהה'
                        : task.priority === 'medium'
                        ? 'בינונית'
                        : 'נמוכה'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(task.dueDate), 'dd/MM')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">אין משימות קרובות</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
