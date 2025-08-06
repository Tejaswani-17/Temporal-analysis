"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useDashboardStore } from '@/store/dashboard-store'

export function TimelineSlider() {
  const { timeRange, isRangeMode, setTimeRange, setRangeMode } = useDashboardStore()
  const [sliderValue, setSliderValue] = useState([0, 100])
  
  // Generate 30 days of hourly data (15 days before and after today)
  const now = new Date()
  const startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
  const endDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
  const totalHours = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
  
  const handleSliderChange = (values: number[]) => {
    setSliderValue(values)
    
    const startHour = Math.floor((values[0] / 100) * totalHours)
    const endHour = isRangeMode ? Math.floor((values[1] / 100) * totalHours) : startHour + 1
    
    const newStart = new Date(startDate.getTime() + startHour * 60 * 60 * 1000)
    const newEnd = new Date(startDate.getTime() + endHour * 60 * 60 * 1000)
    
    setTimeRange({ start: newStart, end: newEnd })
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Timeline Control
          <div className="flex items-center space-x-2">
            <Label htmlFor="range-mode">Range Mode</Label>
            <Switch
              id="range-mode"
              checked={isRangeMode}
              onCheckedChange={setRangeMode}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <div className="w-full h-2 bg-gray-200 rounded-lg">
            <div 
              className="h-2 bg-blue-500 rounded-lg"
              style={{
                marginLeft: `${sliderValue[0]}%`,
                width: isRangeMode ? `${sliderValue[1] - sliderValue[0]}%` : '2px'
              }}
            />
          </div>
          
          {/* Single handle or dual handles */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue[0]}
            onChange={(e) => handleSliderChange([parseInt(e.target.value), sliderValue[1]])}
            className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
          />
          
          {isRangeMode && (
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue[1]}
              onChange={(e) => handleSliderChange([sliderValue[0], parseInt(e.target.value)])}
              className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
            />
          )}
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatDateTime(startDate)}</span>
          <span>{formatDateTime(endDate)}</span>
        </div>
        
        <div className="text-center p-2 bg-gray-50 rounded">
          <strong>Selected: </strong>
          {formatDateTime(timeRange.start)}
          {isRangeMode && ` - ${formatDateTime(timeRange.end)}`}
        </div>
      </CardContent>
    </Card>
  )
}
