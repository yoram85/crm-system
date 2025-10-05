import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Edit2, Trash2, Package, Image as ImageIcon, Download } from 'lucide-react'
import { Product } from '../types'
import { exportProductsToCSV } from '../utils/csvExport'

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    stock: 0,
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingProduct) {
      updateProduct(editingProduct.id, formData)
    } else {
      addProduct(formData)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      stock: 0,
    })
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image || '',
      stock: product.stock,
    })
    setIsModalOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ניהול מוצרים</h1>
        <div className="flex gap-3">
          <button
            onClick={() => exportProductsToCSV(products)}
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
            מוצר חדש
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="card hover:shadow-lg transition-shadow">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{product.category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
                      deleteProduct(product.id)
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{product.description}</p>

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-xl font-bold text-green-600">₪{product.price.toLocaleString()}</span>
              <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                מלאי: {product.stock}
              </span>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p>אין מוצרים עדיין. הוסף מוצר ראשון!</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'עריכת מוצר' : 'מוצר חדש'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Product"
                    className="w-full h-48 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                    <ImageIcon size={48} className="text-gray-400" />
                  </div>
                )}
                <label className="btn-secondary cursor-pointer flex items-center justify-center gap-2 w-full">
                  <ImageIcon size={16} />
                  העלה תמונת מוצר
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">שם המוצר</label>
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
                  <label className="block text-sm font-medium mb-1">מלאי</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingProduct ? 'עדכן' : 'הוסף'}
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

export default Products
