import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Deal } from '../types'
import { DollarSign, Calendar, TrendingUp, User, GripVertical } from 'lucide-react'
import { format } from 'date-fns'

interface DraggableDealCardProps {
  deal: Deal
  customerName: string
}

const DraggableDealCard = ({ deal, customerName }: DraggableDealCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-gray-800 flex-1 text-sm">
          {deal.title}
        </h4>
        <GripVertical size={18} className="text-gray-400 flex-shrink-0" />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <User size={14} className="flex-shrink-0" />
          <span className="truncate">{customerName}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <DollarSign size={14} className="flex-shrink-0" />
          <span className="font-semibold text-green-600">
            ₪{deal.amount.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp size={14} className="flex-shrink-0" />
            <span>{deal.probability}%</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={14} className="flex-shrink-0" />
            <span className="text-xs">
              {format(new Date(deal.expectedCloseDate), 'dd/MM/yy')}
            </span>
          </div>
        </div>
      </div>

      {deal.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 line-clamp-2">{deal.notes}</p>
        </div>
      )}
    </div>
  )
}

export default DraggableDealCard
