import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Deal } from '../types'
import { useStore } from '../store/useStore'
import { DollarSign, Calendar, TrendingUp, User } from 'lucide-react'
import { format } from 'date-fns'
import DraggableDealCard from './DraggableDealCard'

const DealsPipeline = () => {
  const { deals, customers, updateDeal } = useStore()
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const stages: Array<{
    id: 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost'
    label: string
    color: string
    bgColor: string
  }> = [
    { id: 'lead', label: 'ליד', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
    { id: 'proposal', label: 'הצעת מחיר', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
    { id: 'negotiation', label: 'משא ומתן', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
    { id: 'won', label: 'נסגר בהצלחה', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
    { id: 'lost', label: 'אבוד', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
  ]

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    return customer?.name || 'לא ידוע'
  }

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id)
    if (deal) {
      setActiveDeal(deal)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveDeal(null)
      return
    }

    const dealId = active.id as string
    const newStage = over.id as 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost'

    const deal = deals.find((d) => d.id === dealId)
    if (deal && deal.stage !== newStage) {
      updateDeal(dealId, { stage: newStage })
    }

    setActiveDeal(null)
  }

  const handleDragCancel = () => {
    setActiveDeal(null)
  }

  const getStageDeals = (stageId: string) => {
    return deals.filter((deal) => deal.stage === stageId)
  }

  const getStageTotal = (stageId: string) => {
    return getStageDeals(stageId).reduce((sum, deal) => sum + deal.amount, 0)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const stageDeals = getStageDeals(stage.id)
            const stageTotal = getStageTotal(stage.id)

            return (
              <SortableContext
                key={stage.id}
                id={stage.id}
                items={stageDeals.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-shrink-0 w-80">
                  {/* Stage Header */}
                  <div className={`${stage.bgColor} border-2 rounded-lg p-4 mb-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-bold text-lg ${stage.color}`}>
                        {stage.label}
                      </h3>
                      <span className={`${stage.color} text-sm font-semibold`}>
                        {stageDeals.length}
                      </span>
                    </div>
                    <p className={`text-sm ${stage.color} font-medium`}>
                      ₪{stageTotal.toLocaleString()}
                    </p>
                  </div>

                  {/* Droppable Area */}
                  <div
                    className="bg-gray-50 rounded-lg p-2 min-h-[600px] border-2 border-dashed border-gray-300"
                    style={{ minHeight: '600px' }}
                  >
                    <div className="space-y-3">
                      {stageDeals.map((deal) => (
                        <DraggableDealCard
                          key={deal.id}
                          deal={deal}
                          customerName={getCustomerName(deal.customerId)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </SortableContext>
            )
          })}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDeal ? (
          <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 p-4 w-80 opacity-90 cursor-grabbing">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-gray-800 flex-1">
                {activeDeal.title}
              </h4>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={16} />
                <span>{getCustomerName(activeDeal.customerId)}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign size={16} />
                <span className="font-semibold">
                  ₪{activeDeal.amount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp size={16} />
                <span>{activeDeal.probability}%</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span>{format(new Date(activeDeal.expectedCloseDate), 'dd/MM/yyyy')}</span>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default DealsPipeline
