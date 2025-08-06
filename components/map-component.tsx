"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardStore } from '@/store/dashboard-store'
import { Polygon } from '@/types/dashboard'
import { calculatePolygonCentroid, calculateBoundingBox, fetchWeatherData, formatDateForAPI, applyColorRules } from '@/utils/api'

// Mock Leaflet-like interface for demonstration
interface MapInstance {
  setView: (center: [number, number], zoom: number) => void
  on: (event: string, handler: (e: any) => void) => void
  off: (event: string, handler: (e: any) => void) => void
}

export function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<MapInstance | null>(null)
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([])
  
  const {
    polygons,
    isDrawing,
    setDrawing,
    addPolygon,
    removePolygon,
    selectedDataSource,
    dataSources,
    timeRange,
    mapCenter,
    setMapCenter,
    updatePolygonColor
  } = useDashboardStore()

  // Initialize map (mock implementation)
  useEffect(() => {
    if (!mapRef.current) return

    // In a real implementation, you would initialize Leaflet here
    // const map = L.map(mapRef.current).setView(mapCenter, 10)
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    
    // Mock map instance
    const mockMap: MapInstance = {
      setView: (center, zoom) => {
        console.log('Map view set to:', center, zoom)
      },
      on: (event, handler) => {
        if (event === 'click') {
          mapRef.current?.addEventListener('click', (e) => {
            const rect = mapRef.current!.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            
            // Convert pixel coordinates to lat/lng (mock conversion)
            const lat = mapCenter[0] + (y - rect.height / 2) * 0.001
            const lng = mapCenter[1] + (x - rect.width / 2) * 0.001
            
            handler({ latlng: { lat, lng } })
          })
        }
      },
      off: () => {}
    }
    
    mapInstanceRef.current = mockMap
    
    return () => {
      mapInstanceRef.current = null
    }
  }, [mapCenter])

  // Handle map clicks for polygon drawing
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const handleMapClick = (e: any) => {
      if (!isDrawing) return

      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng]
      const updatedPoints = [...drawingPoints, newPoint]
      
      setDrawingPoints(updatedPoints)

      // Complete polygon if we have enough points and user clicks near start
      if (updatedPoints.length >= 3) {
        const firstPoint = updatedPoints[0]
        const distance = Math.sqrt(
          Math.pow(newPoint[0] - firstPoint[0], 2) + 
          Math.pow(newPoint[1] - firstPoint[1], 2)
        )
        
        if (distance < 0.01 || updatedPoints.length >= 12) {
          completePolygon(updatedPoints)
        }
      }
    }

    mapInstanceRef.current.on('click', handleMapClick)

    return () => {
      mapInstanceRef.current?.off('click', handleMapClick)
    }
  }, [isDrawing, drawingPoints])

  const startDrawing = () => {
    setDrawing(true)
    setDrawingPoints([])
  }

  const cancelDrawing = () => {
    setDrawing(false)
    setDrawingPoints([])
  }

  const completePolygon = async (points: [number, number][]) => {
    if (points.length < 3) return

    const centroid = calculatePolygonCentroid(points)
    const boundingBox = calculateBoundingBox(points)
    
    const newPolygon: Polygon = {
      id: `polygon-${Date.now()}`,
      points,
      dataSource: selectedDataSource,
      color: '#3b82f6',
      centroid,
      boundingBox
    }

    // Fetch data and apply color rules
    try {
      const weatherData = await fetchWeatherData(
        centroid[0],
        centroid[1],
        formatDateForAPI(timeRange.start),
        formatDateForAPI(timeRange.end)
      )
      
      const dataSource = dataSources.find(ds => ds.id === selectedDataSource)
      if (dataSource && weatherData.hourly.temperature_2m.length > 0) {
        const avgTemp = weatherData.hourly.temperature_2m.reduce((a, b) => a + b, 0) / weatherData.hourly.temperature_2m.length
        const color = applyColorRules(avgTemp, dataSource.colorRules)
        newPolygon.color = color
      }
    } catch (error) {
      console.error('Failed to fetch weather data:', error)
    }

    addPolygon(newPolygon)
    setDrawing(false)
    setDrawingPoints([])
  }

  const resetMapCenter = () => {
    setMapCenter([52.528, 13.41])
    mapInstanceRef.current?.setView([52.528, 13.41], 10)
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Interactive Map
          <div className="space-x-2">
            <Button
              onClick={startDrawing}
              disabled={isDrawing}
              variant={isDrawing ? "secondary" : "default"}
            >
              {isDrawing ? 'Drawing...' : 'Draw Polygon'}
            </Button>
            {isDrawing && (
              <Button onClick={cancelDrawing} variant="outline">
                Cancel
              </Button>
            )}
            <Button onClick={resetMapCenter} variant="outline">
              Reset Center
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapRef}
          className="w-full h-96 bg-green-100 border-2 border-dashed border-gray-300 rounded-lg relative overflow-hidden cursor-crosshair"
          style={{ backgroundImage: 'radial-gradient(circle, #22c55e 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          {/* Mock map visualization */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="text-lg font-semibold">Interactive Map Area</div>
              <div className="text-sm">Click to draw polygons (3-12 points)</div>
              <div className="text-xs mt-2">Center: {mapCenter[0].toFixed(3)}, {mapCenter[1].toFixed(3)}</div>
            </div>
          </div>

          {/* Render existing polygons */}
          {polygons.map((polygon) => (
            <div
              key={polygon.id}
              className="absolute border-2 rounded"
              style={{
                borderColor: polygon.color,
                backgroundColor: `${polygon.color}33`,
                left: '20%',
                top: '20%',
                width: '60%',
                height: '60%',
                transform: `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`
              }}
            >
              <div className="absolute -top-6 left-0 text-xs bg-white px-1 rounded">
                Polygon {polygon.id.split('-')[1]}
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                onClick={() => removePolygon(polygon.id)}
              >
                ×
              </Button>
            </div>
          ))}

          {/* Show drawing points */}
          {drawingPoints.map((point, index) => (
            <div
              key={index}
              className="absolute w-2 h-2 bg-red-500 rounded-full"
              style={{
                left: `${50 + (point[1] - mapCenter[1]) * 1000}%`,
                top: `${50 + (point[0] - mapCenter[0]) * 1000}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}

          {isDrawing && (
            <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow">
              Points: {drawingPoints.length}/12
              {drawingPoints.length >= 3 && (
                <div className="text-xs text-gray-600">
                  Click near start point or reach 12 points to complete
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <strong>Polygons:</strong> {polygons.length} drawn
          {polygons.length > 0 && (
            <div className="mt-2 space-y-1">
              {polygons.map((polygon) => (
                <div key={polygon.id} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: polygon.color }}
                  />
                  <span>Polygon {polygon.id.split('-')[1]}</span>
                  <span className="text-xs">({polygon.points.length} points)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
