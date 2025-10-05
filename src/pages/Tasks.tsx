import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Edit2, Trash2, CheckSquare, Calendar, AlertCircle, Download } from 'lucide-react'
import { Task } from '../types'
import { format } from 'date-fns'
import { exportTasksToCSV } from '../utils/csvExport'

const Tasks = () => {
  const { tasks, customers, deals, addTask, updateTask, deleteTask } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    customerId: string
    dealId: string
    dueDate: string
    priority: 'low' | 'medium' | 'high'
    status: 'pending' | 'in-progress' | 'completed'
  }>({
    title: '',
    description: '',
    customerId: '',
    dealId: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'pending',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const taskData = {
      ...formData,
      customerId: formData.customerId || undefined,
      dealId: formData.dealId || undefined,
      dueDate: new Date(formData.dueDate),
    }

    if (editingTask) {
      updateTask(editingTask.id, taskData)
    } else {
      addTask(taskData)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      customerId: '',
      dealId: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'pending',
    })
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      customerId: task.customerId || '',
      dealId: task.dealId || '',
      dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
      priority: task.priority,
      status: task.status,
    })
    setIsModalOpen(true)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'גבוהה'
      case 'medium':
        return 'בינונית'
      case 'low':
        return 'נמוכה'
      default:
        return priority
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'הושלם'
      case 'in-progress':
        return 'בביצוע'
      case 'pending':
        return 'ממתין'
      default:
        return status
    }
  }

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return null
    const customer = customers.find((c) => c.id === customerId)
    return customer?.name
  }

  const getDealTitle = (dealId?: string) => {
    if (!dealId) return null
    const deal = deals.find((d) => d.id === dealId)
    return deal?.title
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ניהול משימות</h1>
        <div className="flex gap-3">
          <button
            onClick={() => exportTasksToCSV(tasks, customers)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={20} />
            ייצוא CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            משימה חדשה
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`card hover:shadow-lg transition-shadow ${
              task.status === 'completed' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className={`text-lg font-semibold text-gray-800 ${
                  task.status === 'completed' ? 'line-through' : ''
                }`}>
                  {task.title}
                </h3>
                <div className="flex gap-2 mt-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
                      deleteTask(task.id)
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{task.description}</p>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>תאריך יעד: {format(new Date(task.dueDate), 'dd/MM/yyyy')}</span>
              </div>
              {getCustomerName(task.customerId) && (
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>לקוח: {getCustomerName(task.customerId)}</span>
                </div>
              )}
              {getDealTitle(task.dealId) && (
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>עסקה: {getDealTitle(task.dealId)}</span>
                </div>
              )}
            </div>

            {task.status !== 'completed' && (
              <button
                onClick={() => updateTask(task.id, { status: 'completed' })}
                className="mt-4 w-full btn-primary text-sm"
              >
                <CheckSquare size={16} className="inline ml-2" />
                סמן כהושלם
              </button>
            )}
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
          <p>אין משימות עדיין. הוסף משימה ראשונה!</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTask ? 'עריכת משימה' : 'משימה חדשה'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">כותרת</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">תיאור</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">לקוח (אופציונלי)</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="input-field"
                >
                  <option value="">ללא לקוח</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">עסקה (אופציונלי)</label>
                <select
                  value={formData.dealId}
                  onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
                  className="input-field"
                >
                  <option value="">ללא עסקה</option>
                  {deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">תאריך יעד</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">עדיפות</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="input-field"
                >
                  <option value="low">נמוכה</option>
                  <option value="medium">בינונית</option>
                  <option value="high">גבוהה</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">סטטוס</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="input-field"
                >
                  <option value="pending">ממתין</option>
                  <option value="in-progress">בביצוע</option>
                  <option value="completed">הושלם</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingTask ? 'עדכן' : 'הוסף'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary flex-1"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks
