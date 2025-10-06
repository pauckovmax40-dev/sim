import React, { useState } from 'react'
import { ReceptionExcelRow } from '../../utils/parseReceptionExcel'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface ReceptionPreviewProps {
  data: ReceptionExcelRow[]
  onDataChange?: (data: ReceptionExcelRow[]) => void
}

interface PositionItemProps {
  item: ReceptionExcelRow
  onUpdate?: (updates: Partial<ReceptionExcelRow>) => void
  onNameUpdate?: (newName: string) => void
}

const PositionItem: React.FC<PositionItemProps> = ({ item, onUpdate, onNameUpdate }) => {
  const [isEditingQuantity, setIsEditingQuantity] = useState(false)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editQuantity, setEditQuantity] = useState(item.quantity)
  const [editPrice, setEditPrice] = useState(item.price)
  const [editName, setEditName] = useState(item.itemName)

  const total = item.quantity * item.price
  const isIncome = item.transactionType === 'Доходы'

  const handleQuantitySave = () => {
    if (onUpdate && editQuantity !== item.quantity) {
      onUpdate({ quantity: editQuantity })
    }
    setIsEditingQuantity(false)
  }

  const handlePriceSave = () => {
    if (onUpdate && editPrice !== item.price) {
      onUpdate({ price: editPrice })
    }
    setIsEditingPrice(false)
  }

  const handleNameSave = () => {
    if (onNameUpdate && editName !== item.itemName && editName.trim()) {
      onNameUpdate(editName.trim())
    }
    setIsEditingName(false)
  }

  const handleQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuantitySave()
    } else if (e.key === 'Escape') {
      setEditQuantity(item.quantity)
      setIsEditingQuantity(false)
    }
  }

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePriceSave()
    } else if (e.key === 'Escape') {
      setEditPrice(item.price)
      setIsEditingPrice(false)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave()
    } else if (e.key === 'Escape') {
      setEditName(item.itemName)
      setIsEditingName(false)
    }
  }

  return (
    <div className="py-2 px-3 rounded hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isEditingName && onNameUpdate ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="w-full px-2 py-1 text-sm text-gray-900 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <p
              className={`text-sm text-gray-900 ${onNameUpdate ? 'cursor-pointer hover:text-blue-600' : ''}`}
              onClick={() => onNameUpdate && setIsEditingName(true)}
            >
              {item.itemName}
            </p>
          )}
        </div>
        <div className="text-right">
          {isEditingQuantity && onUpdate ? (
            <input
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(parseFloat(e.target.value) || 0)}
              onBlur={handleQuantitySave}
              onKeyDown={handleQuantityKeyDown}
              autoFocus
              className="w-16 px-2 py-1 text-sm text-right border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <p
              className={`text-sm text-gray-600 font-medium ${onUpdate ? 'cursor-pointer hover:text-blue-600' : ''}`}
              onClick={() => onUpdate && setIsEditingQuantity(true)}
            >
              {item.quantity}
            </p>
          )}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className={`text-xs font-medium ${isIncome ? 'text-green-700' : 'text-red-700'}`}>
          {isIncome ? '+' : ''} {total.toLocaleString('ru-RU')} ₽
        </span>
        {onUpdate && (
          <span className="text-xs text-gray-400">•</span>
        )}
        {isEditingPrice && onUpdate ? (
          <input
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
            onBlur={handlePriceSave}
            onKeyDown={handlePriceKeyDown}
            autoFocus
            className="w-24 px-2 py-1 text-xs text-right border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          onUpdate && (
            <span
              className="text-xs text-gray-500 cursor-pointer hover:text-blue-600"
              onClick={() => setIsEditingPrice(true)}
            >
              {item.price.toLocaleString('ru-RU')} ₽/шт
            </span>
          )
        )}
      </div>
    </div>
  )
}

interface TransactionGroupProps {
  type: string
  items: ReceptionExcelRow[]
  onItemUpdate?: (itemIndex: number, updates: Partial<ReceptionExcelRow>) => void
  onItemNameUpdate?: (itemIndex: number, newName: string) => void
}

const TransactionGroup: React.FC<TransactionGroupProps> = ({ type, items, onItemUpdate, onItemNameUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (items.length === 0) return null

  const isIncome = type === 'Доходы'
  const textColor = isIncome ? 'text-green-600' : 'text-red-600'

  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  return (
    <div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer py-1.5 px-2 hover:bg-gray-50 rounded"
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm text-gray-600">{isIncome ? '↗' : '↘'}</span>
          <h4 className={`text-sm font-medium ${textColor}`}>{type}</h4>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${textColor}`}>
            {isIncome ? '+' : '-'} {Math.abs(total).toLocaleString('ru-RU')} ₽
          </span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-1 space-y-1 pl-4">
          {items.map((item, idx) => (
            <PositionItem
              key={idx}
              item={item}
              onUpdate={onItemUpdate ? (updates) => onItemUpdate(idx, updates) : undefined}
              onNameUpdate={onItemNameUpdate ? (newName) => onItemNameUpdate(idx, newName) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface BaseItemGroupProps {
  baseItemName: string
  items: ReceptionExcelRow[]
  onItemUpdate?: (itemIndex: number, updates: Partial<ReceptionExcelRow>) => void
  onItemNameUpdate?: (itemIndex: number, newName: string) => void
}

const BaseItemGroup: React.FC<BaseItemGroupProps> = ({ baseItemName, items, onItemUpdate, onItemNameUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const incomeItems = items.filter(item => item.transactionType === 'Доходы')
  const expenseItems = items.filter(item => item.transactionType === 'Расходы')

  const incomeTotal = incomeItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const expenseTotal = expenseItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const profit = incomeTotal + expenseTotal

  return (
    <div className="bg-blue-50 rounded-lg px-3 py-2">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer"
      >
        <h3 className="text-sm font-medium text-gray-800 flex-1">{baseItemName}</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-medium">↗ {incomeTotal.toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-blue-600 font-semibold">₽ {profit.toLocaleString('ru-RU')} ₽</span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-3">
          <TransactionGroup
            type="Доходы"
            items={incomeItems}
            onItemUpdate={onItemUpdate ? (idx, updates) => {
              const globalIdx = items.indexOf(incomeItems[idx])
              onItemUpdate(globalIdx, updates)
            } : undefined}
            onItemNameUpdate={onItemNameUpdate ? (idx, newName) => {
              const globalIdx = items.indexOf(incomeItems[idx])
              onItemNameUpdate(globalIdx, newName)
            } : undefined}
          />
          <TransactionGroup
            type="Расходы"
            items={expenseItems}
            onItemUpdate={onItemUpdate ? (idx, updates) => {
              const globalIdx = items.indexOf(expenseItems[idx])
              onItemUpdate(globalIdx, updates)
            } : undefined}
            onItemNameUpdate={onItemNameUpdate ? (idx, newName) => {
              const globalIdx = items.indexOf(expenseItems[idx])
              onItemNameUpdate(globalIdx, newName)
            } : undefined}
          />
        </div>
      )}
    </div>
  )
}

interface WorkGroupProps {
  workGroup: string
  items: ReceptionExcelRow[]
  onItemUpdate?: (itemIndex: number, updates: Partial<ReceptionExcelRow>) => void
  onItemNameUpdate?: (itemIndex: number, newName: string) => void
}

const WorkGroup: React.FC<WorkGroupProps> = ({ workGroup, items, onItemUpdate, onItemNameUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const baseItemMap = new Map<string, ReceptionExcelRow[]>()
  for (const item of items) {
    const baseName = item.itemName.split('_ID_')[0].trim()
    if (!baseItemMap.has(baseName)) {
      baseItemMap.set(baseName, [])
    }
    baseItemMap.get(baseName)!.push(item)
  }

  const incomeTotal = items
    .filter(item => item.transactionType === 'Доходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const expenseTotal = items
    .filter(item => item.transactionType === 'Расходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const profit = incomeTotal + expenseTotal

  return (
    <div className="border-l-4 border-blue-400 pl-3">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer py-2 px-3 hover:bg-blue-50 rounded"
      >
        <h2 className="text-sm font-medium text-gray-800 flex-1">{workGroup}</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-medium">↗ {incomeTotal.toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-blue-600 font-semibold">₽ {profit.toLocaleString('ru-RU')} ₽</span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-2">
          {Array.from(baseItemMap.entries()).map(([baseName, baseItems]) => (
            <BaseItemGroup
              key={baseName}
              baseItemName={baseName}
              items={baseItems}
              onItemUpdate={onItemUpdate ? (idx, updates) => {
                const globalIdx = items.indexOf(baseItems[idx])
                onItemUpdate(globalIdx, updates)
              } : undefined}
              onItemNameUpdate={onItemNameUpdate ? (idx, newName) => {
                const globalIdx = items.indexOf(baseItems[idx])
                onItemNameUpdate(globalIdx, newName)
              } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface PositionGroupProps {
  positionNumber: number
  items: ReceptionExcelRow[]
  onItemUpdate?: (itemIndex: number, updates: Partial<ReceptionExcelRow>) => void
  onItemNameUpdate?: (itemIndex: number, newName: string) => void
}

const PositionGroup: React.FC<PositionGroupProps> = ({ positionNumber, items, onItemUpdate, onItemNameUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const firstItem = items[0]

  const workGroupMap = new Map<string, ReceptionExcelRow[]>()
  for (const item of items) {
    if (!workGroupMap.has(item.workGroup)) {
      workGroupMap.set(item.workGroup, [])
    }
    workGroupMap.get(item.workGroup)!.push(item)
  }

  const incomeTotal = items
    .filter(item => item.transactionType === 'Доходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const expenseTotal = items
    .filter(item => item.transactionType === 'Расходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const profit = incomeTotal + expenseTotal

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-t-lg cursor-pointer"
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
            {positionNumber}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{firstItem.serviceName}</h2>
            <p className="text-xs text-gray-600">{firstItem.subdivisionName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-600 font-medium">↗ {incomeTotal.toLocaleString('ru-RU')} ₽</span>
          <span className="text-sm text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-sm text-blue-600 font-semibold">₽ {profit.toLocaleString('ru-RU')} ₽</span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {Array.from(workGroupMap.entries()).map(([workGroup, workItems]) => (
            <WorkGroup
              key={workGroup}
              workGroup={workGroup}
              items={workItems}
              onItemUpdate={onItemUpdate ? (idx, updates) => {
                const globalIdx = items.indexOf(workItems[idx])
                onItemUpdate(globalIdx, updates)
              } : undefined}
              onItemNameUpdate={onItemNameUpdate ? (idx, newName) => {
                const globalIdx = items.indexOf(workItems[idx])
                onItemNameUpdate(globalIdx, newName)
              } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const ReceptionPreview: React.FC<ReceptionPreviewProps> = ({ data, onDataChange }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Нет данных для отображения. Загрузите Excel файл.
      </div>
    )
  }

  const firstRow = data[0]

  const motorGroups = new Map<number, ReceptionExcelRow[]>()
  for (const row of data) {
    if (!motorGroups.has(row.positionNumber)) {
      motorGroups.set(row.positionNumber, [])
    }
    motorGroups.get(row.positionNumber)!.push(row)
  }

  const sortedGroups = Array.from(motorGroups.entries()).sort(
    ([a], [b]) => a - b
  )

  const handleItemUpdate = (positionNumber: number, itemIndex: number, updates: Partial<ReceptionExcelRow>) => {
    if (!onDataChange) return

    const newData = [...data]
    const positionItems = motorGroups.get(positionNumber)!
    const item = positionItems[itemIndex]
    const globalIndex = newData.indexOf(item)

    if (globalIndex !== -1) {
      newData[globalIndex] = { ...newData[globalIndex], ...updates }
      onDataChange(newData)
    }
  }

  const handleItemNameUpdate = (positionNumber: number, itemIndex: number, newName: string) => {
    if (!onDataChange) return

    const positionItems = motorGroups.get(positionNumber)!
    const item = positionItems[itemIndex]
    const oldBaseName = item.itemName.split('_ID_')[0].trim()

    const newData = data.map((row) => {
      if (row.positionNumber === positionNumber) {
        const currentBaseName = row.itemName.split('_ID_')[0].trim()
        if (currentBaseName === oldBaseName) {
          const idPart = row.itemName.includes('_ID_') ? row.itemName.split('_ID_')[1] : ''
          const newItemName = idPart ? `${newName}_ID_${idPart}` : newName
          return { ...row, itemName: newItemName }
        }
      }
      return row
    })
    onDataChange(newData)
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Информация о приемке</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Номер приемки:</span>
            <p className="font-medium">{firstRow.receptionNumber}</p>
          </div>
          <div>
            <span className="text-gray-500">Дата приемки:</span>
            <p className="font-medium">{firstRow.receptionDate}</p>
          </div>
          <div>
            <span className="text-gray-500">Контрагент:</span>
            <p className="font-medium">{firstRow.counterpartyName}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700">
          Двигатели ({sortedGroups.length})
        </h3>
        {sortedGroups.map(([positionNumber, items]) => (
          <PositionGroup
            key={positionNumber}
            positionNumber={positionNumber}
            items={items}
            onItemUpdate={onDataChange ? (idx, updates) => handleItemUpdate(positionNumber, idx, updates) : undefined}
            onItemNameUpdate={onDataChange ? (idx, newName) => handleItemNameUpdate(positionNumber, idx, newName) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
