import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Customer } from '../types';
import { Plus, Edit2, Trash2, Phone, Mail, Building, Users, Upload, User, Search, Filter, Download } from 'lucide-react';
import { exportCustomersToCSV } from '../utils/csvExport';

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'lead'>('all');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    profileImage: '',
    status: 'active' as 'active' | 'inactive' | 'lead',
    notes: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const customerData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
    };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerData);
    } else {
      addCustomer(customerData);
    }

    handleCloseModal();
  };

  const handleEdit = (customer: Customer) => {
    const nameParts = customer.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setEditingCustomer(customer);
    setFormData({
      firstName,
      lastName,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      profileImage: (customer as any).profileImage || '',
      status: customer.status,
      notes: customer.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק לקוח זה?')) {
      deleteCustomer(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      profileImage: '',
      status: 'active',
      notes: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'lead':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'פעיל';
      case 'lead':
        return 'ליד';
      case 'inactive':
        return 'לא פעיל';
      default:
        return status;
    }
  };

  // Filter and search customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">לקוחות</h1>
          <p className="text-gray-600">ניהול לקוחות ומידע ליצירת קשר</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportCustomersToCSV(customers)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-5 h-5" />
            ייצוא CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            לקוח חדש
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="חיפוש לפי שם, אימייל, טלפון או חברה..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'lead')}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="active">פעיל</option>
              <option value="lead">ליד</option>
              <option value="inactive">לא פעיל</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">סך הכל לקוחות</p>
              <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">לקוחות פעילים</p>
              <p className="text-3xl font-bold text-green-600">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
            <Users className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">לידים</p>
              <p className="text-3xl font-bold text-blue-600">
                {customers.filter(c => c.status === 'lead').length}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const customerWithImage = customer as Customer & { profileImage?: string };
          return (
            <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {customerWithImage.profileImage ? (
                    <img
                      src={customerWithImage.profileImage}
                      alt={customer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(customer.status)}`}>
                      {getStatusLabel(customer.status)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4" />
                  <span className="text-sm">{customer.company}</span>
                </div>
              </div>

              {customer.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">{customer.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCustomer ? 'עריכת לקוח' : 'לקוח חדש'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center gap-4">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  העלה תמונת פרופיל
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם פרטי *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם משפחה *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אימייל *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  חברה
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  סטטוס
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'lead' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="lead">ליד</option>
                  <option value="active">פעיל</option>
                  <option value="inactive">לא פעיל</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  הערות
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCustomer ? 'עדכן' : 'צור'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
