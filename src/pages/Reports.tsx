import { useStore } from '../store/useStore'
import { FileText, Download, TrendingUp, Users, DollarSign, CheckSquare, Package, Briefcase } from 'lucide-react'
import {
  exportCustomersToPDF,
  exportDealsToPDF,
  exportTasksToPDF,
  exportProductsToPDF,
  exportServicesToPDF,
  exportComprehensiveReport,
} from '../utils/pdfExport'

const Reports = () => {
  const { customers, deals, tasks, products, services } = useStore()

  const reports = [
    {
      title: 'דוח לקוחות',
      description: 'רשימה מלאה של כל הלקוחות כולל פרטי קשר וסטטוסים',
      icon: Users,
      color: 'bg-blue-500',
      count: customers.length,
      action: () => exportCustomersToPDF(customers),
    },
    {
      title: 'דוח עסקאות',
      description: 'כל העסקאות כולל סכומים, שלבים וסבירות סגירה',
      icon: DollarSign,
      color: 'bg-green-500',
      count: deals.length,
      action: () => exportDealsToPDF(deals, customers),
    },
    {
      title: 'דוח משימות',
      description: 'רשימת משימות עם סטטוסים, עדיפויות ותאריכי יעד',
      icon: CheckSquare,
      color: 'bg-orange-500',
      count: tasks.length,
      action: () => exportTasksToPDF(tasks, customers),
    },
    {
      title: 'דוח מוצרים',
      description: 'קטלוג מוצרים כולל מחירים ומלאי',
      icon: Package,
      color: 'bg-purple-500',
      count: products.length,
      action: () => exportProductsToPDF(products),
    },
    {
      title: 'דוח שירותים',
      description: 'רשימת שירותים עם מחירים ומשך זמן',
      icon: Briefcase,
      color: 'bg-pink-500',
      count: services.length,
      action: () => exportServicesToPDF(services),
    },
    {
      title: 'דוח עסקי מקיף',
      description: 'סיכום כולל של כל נתוני המערכת',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      count: customers.length + deals.length + tasks.length,
      action: () =>
        exportComprehensiveReport(customers, deals, tasks, products, services),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">דוחות</h1>
        <p className="text-gray-600 mt-1">
          ייצוא דוחות מפורטים בפורמט PDF
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <FileText className="text-blue-600 flex-shrink-0 mt-1" size={24} />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">
            אודות הדוחות
          </h3>
          <p className="text-sm text-blue-700">
            כל הדוחות מיוצאים בפורמט PDF ומכילים את כל הנתונים העדכניים ביותר
            מהמערכת. הדוחות כוללים סיכומים סטטיסטיים וטבלאות מפורטות.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <div
              key={report.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`${report.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  {report.count} רשומות
                </div>
                <button
                  onClick={report.action}
                  disabled={report.count === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    report.count === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Download size={18} />
                  ייצא PDF
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Statistics Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          סטטיסטיקות כלליות
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {customers.length}
            </div>
            <div className="text-sm text-gray-600">לקוחות</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {deals.length}
            </div>
            <div className="text-sm text-gray-600">עסקאות</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <CheckSquare className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {tasks.length}
            </div>
            <div className="text-sm text-gray-600">משימות</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {products.length}
            </div>
            <div className="text-sm text-gray-600">מוצרים</div>
          </div>

          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <Briefcase className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {services.length}
            </div>
            <div className="text-sm text-gray-600">שירותים</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">הכנסות (עסקאות שנסגרו):</span>
              <span className="font-semibold text-green-600">
                ₪
                {deals
                  .filter((d) => d.stage === 'won')
                  .reduce((sum, d) => sum + d.amount, 0)
                  .toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">משימות שהושלמו:</span>
              <span className="font-semibold text-blue-600">
                {tasks.filter((t) => t.status === 'completed').length} /{' '}
                {tasks.length}
              </span>
            </div>

            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">לקוחות פעילים:</span>
              <span className="font-semibold text-purple-600">
                {customers.filter((c) => c.status === 'active').length} /{' '}
                {customers.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
