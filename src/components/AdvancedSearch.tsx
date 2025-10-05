import { useState } from 'react';
import { Search, X, Filter, Calendar, DollarSign, Tag } from 'lucide-react';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  keyword: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  status?: string;
  category?: string;
  tags?: string[];
}

const AdvancedSearch = ({ isOpen, onClose, onSearch }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    dateFrom: '',
    dateTo: '',
    amountMin: undefined,
    amountMax: undefined,
    status: '',
    category: '',
    tags: [],
  });

  const [currentTag, setCurrentTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      dateFrom: '',
      dateTo: '',
      amountMin: undefined,
      amountMax: undefined,
      status: '',
      category: '',
      tags: [],
    });
    setCurrentTag('');
  };

  const addTag = () => {
    if (currentTag.trim() && !filters.tags?.includes(currentTag.trim())) {
      setFilters({
        ...filters,
        tags: [...(filters.tags || []), currentTag.trim()],
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFilters({
      ...filters,
      tags: filters.tags?.filter((t) => t !== tag) || [],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">חיפוש מתקדם</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Keyword Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Search size={16} />
                מילת חיפוש
              </div>
            </label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              placeholder="חיפוש בכל השדות..."
              className="input-field"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  מתאריך
                </div>
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  עד תאריך
                </div>
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} />
                  סכום מינימלי (₪)
                </div>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.amountMin || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    amountMin: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="0.00"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} />
                  סכום מקסימלי (₪)
                </div>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.amountMax || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    amountMax: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="0.00"
                className="input-field"
              />
            </div>
          </div>

          {/* Status & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  סטטוס
                </div>
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input-field"
              >
                <option value="">הכל</option>
                <option value="active">פעיל</option>
                <option value="inactive">לא פעיל</option>
                <option value="lead">ליד</option>
                <option value="pending">ממתין</option>
                <option value="closed">סגור</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Tag size={16} />
                  קטגוריה
                </div>
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="input-field"
              >
                <option value="">הכל</option>
                <option value="customer">לקוח</option>
                <option value="deal">עסקה</option>
                <option value="task">משימה</option>
                <option value="product">מוצר</option>
                <option value="service">שירות</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Tag size={16} />
                תגיות
              </div>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="הוסף תגית..."
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                הוסף
              </button>
            </div>
            {filters.tags && filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              איפוס
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Search size={18} />
              חפש
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearch;
