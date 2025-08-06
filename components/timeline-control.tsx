"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useDashboardStore } from '@/store/dashboard-store'

export function TimelineControl() {
  const { timeRange, isRangeMode, setTimeRange, setRangeMode } = useDashboardStore()
  const [sliderValue, setSliderValue] = useState(50) // Start at "Today"
  
  const totalDays = 30 // 15 days before and after
  const now = new Date()
  const startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
  
  const getCurrentTimeLabel = () => {
    const currentDate = timeRange.current
    const today = new Date()
    
    if (currentDate.toDateString() === today.toDateString()) {
      return `Today ${currentDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else {
      return currentDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const handleSliderChange = (value: number) => {
    setSliderValue(value)
    
    // Convert slider value (0-100) to actual date
    const dayOffset = ((value / 100) * totalDays) - 15 // -15 to +15 days
    const newCurrent = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000)
    
    setTimeRange({
      ...timeRange,
      current: newCurrent
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-600">Timeline Control</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRangeMode(!isRangeMode)}
          className="text-sm"
        >
          Switch to {isRangeMode ? 'Single' : 'Range'}
        </Button>
      </div>

      {/* Current Time Display */}
      <div className="mb-6">
        <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
          {getCurrentTimeLabel()}
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="relative mb-4">
        <div className="relative h-2 bg-gray-200 rounded-full">
          {/* Track */}
          <div className="absolute inset-0 bg-gray-200 rounded-full" />
          
          {/* Active portion */}
          <div 
            className="absolute h-2 bg-gray-800 rounded-full"
            style={{
              left: '0%',
              width: `${sliderValue}%`
            }}
          />
          
          {/* Slider handle */}
          <div 
            className="absolute w-4 h-4 bg-white border-2 border-gray-800 rounded-full transform -translate-y-1 -translate-x-2 cursor-pointer shadow-sm"
            style={{ left: `${sliderValue}%` }}
          />
        </div>
        
        {/* Hidden range input for interaction */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={(e) => handleSliderChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
      </div>

      {/* Timeline Labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>-15d</span>
        <span className="font-medium text-gray-700">Today</span>
        <span>+15d</span>
      </div>
    </div>
  )
}
