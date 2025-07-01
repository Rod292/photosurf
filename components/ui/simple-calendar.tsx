'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SimpleCalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
}

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

export function SimpleCalendar({ selectedDate, onDateSelect }: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date()
  })

  // Obtenir les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Jours vides pour aligner le premier jour
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const handleDateClick = (date: Date) => {
    // Utiliser le fuseau horaire local pour éviter les décalages
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    onDateSelect(dateString)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    if (!selectedDate) return false
    const selected = new Date(selectedDate)
    return date.toDateString() === selected.toDateString()
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="w-64">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between p-3 border-b">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        
        <h3 className="text-sm font-medium text-gray-900">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Grid du calendrier */}
      <div className="p-3">
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center py-1 text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Jours du mois */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <div key={index} className="aspect-square">
              {date && (
                <button
                  onClick={() => handleDateClick(date)}
                  className={`
                    w-full h-full flex items-center justify-center text-xs rounded
                    transition-all duration-150 font-medium
                    ${isSelected(date) 
                      ? 'bg-blue-500 text-white' 
                      : isToday(date)
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}