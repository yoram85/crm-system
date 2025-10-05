import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Edit2, Trash2, DollarSign, TrendingUp, Search, Filter, Download } from 'lucide-react'
import { Deal, DealItem } from '../types'
import { format } from 'date-fns'
import DealItemsSelector from '../components/DealItemsSelector'
import { exportDealsToCSV } from '../utils/csvExport'

const Deals = () => {
  const { deals, customers, products, services, addDeal, updateDeal, deleteDeal } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<'all' | 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost'>('all')
  const [formData, setFormData] = useState<{
    title: string
    customerId: string
    amount: number
    stage: 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost'
    probability: number
    expectedCloseDate: string
    notes: string
    items: DealItem[]
  }>({
    title: '',
    customerId: '',
    amount: 0,
    stage: 'lead',
    probability: 50,
    expectedCloseDate: new Date().toISOString().split('T')[0],
    notes: '',
    items: [],
  })

  // חישוב אוטומטי של סכום העסקה מהפריטים
  useEffect(() => {
    if (formData.items.length > 0) {
      const total = formData.items.reduce((sum, item) => {
        const subtotal = item.price * item.quantity
        const discount = item.discount || 0
        return sum + (subtotal - (subtotal * discount / 100))
      }, 0)
      setFormData(prev => ({ ...prev, amount: Math.round(total * 100) / 100 }))
    }
  }, [formData.items])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dealData = {
      ...formData,
      expectedCloseDate: new Date(formData.expectedCloseDate),
    }

    if (editingDeal) {
      updateDeal(editingDeal.id, dealData)
    } else {
      addDeal(dealData)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      customerId: '',
      amount: 0,
      stage: 'lead',
      probability: 50,
      items: [],
      expectedCloseDate: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setIsModalOpen(false)
    setEditingDeal(null)
  }

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal)
    setFormData({
      title: deal.title,
      customerId: deal.customerId,
      amount: deal.amount,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: format(new Date(deal.expectedCloseDate), 'yyyy-MM-dd'),
      notes: deal.notes,
      items: deal.items || [],
    })
    setIsModalOpen(true)
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead':
        return 'bg-blue-100 text-blue-800'
      case 'proposal':
        return 'bg-purple-100 text-purple-800'
      case 'negotiation':
        return 'bg-yellow-100 text-yellow-800'
      case 'won':
        return 'bg-green-100 text-green-800'
      case 'lost':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'lead':
        return 'ליד'
      case 'proposal':
        return 'הצעת מחיר'
      case 'negotiation':
        return 'משא ומתן'
      case 'won':
        return 'נסגר בהצלחה'
      case 'lost':
        return 'אבוד'
      default:
        return stage
    }
  }

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    return customer?.name || 'לא ידוע'
  }

  // Filter and search deals
  const filteredDeals = deals.filter(deal => {
    const customerName = getCustomerName(deal.customerId)
    const matchesSearch =
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.notes.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter

    return matchesSearch && matchesStage
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ניהול עסקאות</h1>
        <div className="flex gap-3">
          <button
            onClick={() => exportDealsToCSV(deals, customers)}
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
            עסקה חדשה
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="חיפוש לפי כותרת, לקוח או הערות..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as any)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">כל השלבים</option>
              <option value="lead">ליד</option>
              <option value="proposal">הצעת מחיר</option>
              <option value="negotiation">משא ומתן</option>
              <option value="won">נסגר בהצלחה</option>
              <option value="lost">אבוד</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeals.map((deal) => (
          <div key={deal.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{deal.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{getCustomerName(deal.customerId)}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${getStageColor(deal.stage)}`}>
                  {getStageLabel(deal.stage)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(deal)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('האם אתה בטוח שברצונך למחוק עסקה זו?')) {
                      deleteDeal(deal.id)
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <DollarSign size={16} />
                <span>₪{deal.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp size={16} />
                <span>סבירות: {deal.probability}%</span>
              </div>
              <div className="text-gray-600">
                <span>תאריך סגירה צפוי: {format(new Date(deal.expectedCloseDate), 'dd/MM/yyyy')}</span>
              </div>
            </div>

            {deal.notes && (
              <p className="mt-3 text-sm text-gray-500 border-t pt-3">
                {deal.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {filteredDeals.length === 0 && deals.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
          <p>לא נמצאו עסקאות התואמות את החיפוש</p>
        </div>
      )}

      {deals.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
          <p>אין עסקאות עדיין. הוסף עסקה ראשונה!</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingDeal ? 'עריכת עסקה' : 'עסקה חדשה'}
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
                <label className="block text-sm font-medium mb-1">לקוח</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="input-field"
                >
                  <option value="">בחר לקוח</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">סכום (₪)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">שלב</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                  className="input-field"
                >
                  <option value="lead">ליד</option>
                  <option value="proposal">הצעת מחיר</option>
                  <option value="negotiation">משא ומתן</option>
                  <option value="won">נסגר בהצלחה</option>
                  <option value="lost">אבוד</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  סבירות לסגירה ({formData.probability}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">תאריך סגירה צפוי</label>
                <input
                  type="date"
                  required
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* בחירת מוצרים ושירותים */}
              <DealItemsSelector
                items={formData.items}
                products={products}
                services={services}
                onChange={(items) => setFormData({ ...formData, items })}
              />

              <div>
                <label className="block text-sm font-medium mb-1">הערות</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingDeal ? 'עדכן' : 'הוסף'}
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

export default Deals
