import { useState } from 'react'
import { Plus, Trash2, Package, Briefcase } from 'lucide-react'
import { DealItem, Product, Service } from '../types'

interface DealItemsSelectorProps {
  items: DealItem[]
  products: Product[]
  services: Service[]
  onChange: (items: DealItem[]) => void
}

export default function DealItemsSelector({ items, products, services, onChange }: DealItemsSelectorProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState<'product' | 'service'>('product')

  const addItem = (type: 'product' | 'service', itemId: string) => {
    const item = type === 'product'
      ? products.find(p => p.id === itemId)
      : services.find(s => s.id === itemId)

    if (!item) return

    const newItem: DealItem = {
      id: crypto.randomUUID(),
      type,
      itemId,
      quantity: 1,
      price: item.price,
      discount: 0,
    }

    onChange([...items, newItem])
    setShowAddModal(false)
  }

  const updateItem = (id: string, updates: Partial<DealItem>) => {
    onChange(items.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id))
  }

  const getItemName = (item: DealItem) => {
    if (item.type === 'product') {
      return products.find(p => p.id === item.itemId)?.name || 'מוצר לא ידוע'
    }
    return services.find(s => s.id === item.itemId)?.name || 'שירות לא ידוע'
  }

  const calculateItemTotal = (item: DealItem) => {
    const subtotal = item.price * item.quantity
    const discount = item.discount || 0
    return subtotal - (subtotal * discount / 100)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const availableProducts = products.filter(p => !items.some(i => i.type === 'product' && i.itemId === p.id))
  const availableServices = services.filter(s => !items.some(i => i.type === 'service' && i.itemId === s.id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          מוצרים ושירותים
        </label>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          הוסף פריט
        </button>
      </div>

      {/* רשימת פריטים */}
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-shrink-0">
                {item.type === 'product' ? (
                  <Package className="w-5 h-5 text-blue-600" />
                ) : (
                  <Briefcase className="w-5 h-5 text-purple-600" />
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{getItemName(item)}</p>
                  <p className="text-xs text-gray-500">{item.type === 'product' ? 'מוצר' : 'שירות'}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-600">כמות</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">מחיר ליחידה</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">הנחה (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount || 0}
                    onChange={(e) => updateItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">₪{calculateItemTotal(item).toFixed(2)}</p>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div className="flex justify-end p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-left">
              <p className="text-sm text-gray-600">סך הכל</p>
              <p className="text-xl font-bold text-blue-600">₪{calculateTotal().toFixed(2)}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">לא נוספו פריטים לעסקה</p>
      )}

      {/* מודל הוספת פריט */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">הוסף פריט לעסקה</h3>
            </div>

            <div className="p-6">
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedType('product')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    selectedType === 'product'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Package className="inline w-4 h-4 ml-2" />
                  מוצרים
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('service')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    selectedType === 'service'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Briefcase className="inline w-4 h-4 ml-2" />
                  שירותים
                </button>
              </div>

              <div className="space-y-2">
                {selectedType === 'product' ? (
                  availableProducts.length > 0 ? (
                    availableProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addItem('product', product.id)}
                        className="w-full text-right p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.description}</p>
                          </div>
                          <p className="text-lg font-bold text-blue-600">₪{product.price}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">כל המוצרים כבר נוספו</p>
                  )
                ) : (
                  availableServices.length > 0 ? (
                    availableServices.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => addItem('service', service.id)}
                        className="w-full text-right p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                          <p className="text-lg font-bold text-purple-600">₪{service.price}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">כל השירותים כבר נוספו</p>
                  )
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
