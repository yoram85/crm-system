import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Edit2, Trash2, Briefcase, Clock, Download } from 'lucide-react'
import { Service } from '../types'
import { exportServicesToCSV } from '../utils/csvExport'

const Services = () => {
  const { services, addService, updateService, deleteService } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    category: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingService) {
      updateService(editingService.id, formData)
    } else {
      addService(formData)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 60,
      category: '',
    })
    setIsModalOpen(false)
    setEditingService(null)
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
    })
    setIsModalOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ניהול שירותים</h1>
        <div className="flex gap-3">
          <button
            onClick={() => exportServicesToCSV(services)}
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
            שירות חדש
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{service.category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('האם אתה בטוח שברצונך למחוק שירות זה?')) {
                      deleteService(service.id)
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{service.description}</p>

            <div className="space-y-2 pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-green-600">₪{service.price.toLocaleString()}</span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>{service.duration} דקות</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
          <p>אין שירותים עדיין. הוסף שירות ראשון!</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingService ? 'עריכת שירות' : 'שירות חדש'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">שם השירות</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <label className="block text-sm font-medium mb-1">קטגוריה</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">מחיר (₪)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">משך (דקות)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingService ? 'עדכן' : 'הוסף'}
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

export default Services
