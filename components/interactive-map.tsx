"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDashboardStore } from '@/store/dashboard-store'
import { MapPin, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

// Leaflet types and imports (will be loaded dynamically)
declare global {
  interface Window {
    L: any
  }
}

export function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const drawingLayerRef = useRef<any>(null)
  const polygonLayersRef = useRef<any[]>([])
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  
  const {
    polygons,
    isDrawing,
    currentDrawingPoints,
    isMapLoading,
    mapCenter,
    setDrawing,
    addDrawingPoint,
    finishPolygon,
    clearDrawingPoints,
    setMapLoading,
    setMapCenter,
    removePolygon
  } = useDashboardStore()

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // Load Leaflet CSS
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        // Load Leaflet JS
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
          setLeafletLoaded(true)
          setMapLoading(false)
        }
        document.head.appendChild(script)
      } else if (window.L) {
        setLeafletLoaded(true)
        setMapLoading(false)
      }
    }

    loadLeaflet()
  }, [setMapLoading])

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return

    const L = window.L

    // Create map
    const map = L.map(mapRef.current, {
      center: mapCenter,
      zoom: 10,
      zoomControl: false // We'll add custom controls
    })

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map)

    // Create drawing layer
    const drawingLayer = L.layerGroup().addTo(map)
    drawingLayerRef.current = drawingLayer

    mapInstanceRef.current = map

    // Handle map clicks for drawing
    const handleMapClick = (e: any) => {
      if (!isDrawing) return
      
      const { lat, lng } = e.latlng
      addDrawingPoint([lat, lng])
      
      // Add visual marker for the point
      L.circleMarker([lat, lng], {
        radius: 4,
        fillColor: '#3b82f6',
        color: '#1d4ed8',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(drawingLayer)
      
      // Draw lines between points
      const points = [...currentDrawingPoints, [lat, lng]]
      if (points.length > 1) {
        L.polyline(points, {
          color: '#3b82f6',
          weight: 2,
          opacity: 0.7,
          dashArray: '5, 5'
        }).addTo(drawingLayer)
      }
    }

    map.on('click', handleMapClick)

    // Handle map movement
    map.on('moveend', () => {
      const center = map.getCenter()
      setMapCenter([center.lat, center.lng])
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [leafletLoaded, mapCenter, isDrawing, currentDrawingPoints, addDrawingPoint, setMapCenter])

  // Update drawing visualization
  useEffect(() => {
    if (!leafletLoaded || !drawingLayerRef.current) return

    const L = window.L
    const drawingLayer = drawingLayerRef.current

    // Clear previous drawing
    drawingLayer.clearLayers()

    // Add current drawing points
    currentDrawingPoints.forEach((point, index) => {
      L.circleMarker(point, {
        radius: 4,
        fillColor: '#3b82f6',
        color: '#1d4ed8',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(drawingLayer)

      // Add point number
      L.marker(point, {
        icon: L.divIcon({
          className: 'point-label',
          html: `<div style="background: white; border: 1px solid #3b82f6; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">${index + 1}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(drawingLayer)
    })

    // Draw lines between points
    if (currentDrawingPoints.length > 1) {
      L.polyline(currentDrawingPoints, {
        color: '#3b82f6',
        weight: 2,
        opacity: 0.7,
        dashArray: '5, 5'
      }).addTo(drawingLayer)
    }

    // Show closing line if we have 3+ points
    if (currentDrawingPoints.length >= 3) {
      const closingPoints = [currentDrawingPoints[currentDrawingPoints.length - 1], currentDrawingPoints[0]]
      L.polyline(closingPoints, {
        color: '#10b981',
        weight: 2,
        opacity: 0.5,
        dashArray: '10, 5'
      }).addTo(drawingLayer)
    }
  }, [currentDrawingPoints, leafletLoaded])

  // Update polygon visualization
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return

    const L = window.L
    const map = mapInstanceRef.current

    // Remove existing polygon layers
    polygonLayersRef.current.forEach(layer => {
      map.removeLayer(layer)
    })
    polygonLayersRef.current = []

    // Add current polygons
    polygons.forEach((polygon, index) => {
      if (polygon.points.length >= 3) {
        const polygonLayer = L.polygon(polygon.points, {
          color: polygon.color,
          weight: 2,
          opacity: 0.8,
          fillColor: polygon.color,
          fillOpacity: 0.2
        }).addTo(map)

        // Add popup with polygon info
        polygonLayer.bindPopup(`
          <div style="font-family: system-ui;">
            <strong>Polygon ${index + 1}</strong><br>
            <small>Points: ${polygon.points.length}</small><br>
            <small>Data Source: ${polygon.dataSource}</small><br>
            <button onclick="window.removePolygon('${polygon.id}')" style="margin-top: 8px; padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
          </div>
        `)

        polygonLayersRef.current.push(polygonLayer)
      }
    })

    // Global function for removing polygons from popup
    ;(window as any).removePolygon = (id: string) => {
      removePolygon(id)
    }
  }, [polygons, leafletLoaded, removePolygon])

  const startDrawing = () => {
    setDrawing(true)
    clearDrawingPoints()
    if (drawingLayerRef.current) {
      drawingLayerRef.current.clearLayers()
    }
  }

  const handleFinishPolygon = () => {
    if (currentDrawingPoints.length >= 3) {
      finishPolygon()
      if (drawingLayerRef.current) {
        drawingLayerRef.current.clearLayers()
      }
    }
  }

  const cancelDrawing = () => {
    setDrawing(false)
    clearDrawingPoints()
    if (drawingLayerRef.current) {
      drawingLayerRef.current.clearLayers()
    }
  }

  const resetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([52.528, 13.41], 10)
    }
  }

  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut()
    }
  }

  return (
    <div className="flex-1 bg-white rounded-lg border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Interactive Map</h3>
              <p className="text-sm text-gray-600">
                Real-time data visualization • Colors update automatically based on timeline and rules
              </p>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapRef}
            className="w-full h-96 bg-gray-100 border border-gray-200 rounded-lg relative overflow-hidden"
            style={{ minHeight: '400px' }}
          >
            {/* Loading overlay */}
            {isMapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[1000]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <div className="text-sm text-gray-600">Loading map...</div>
                </div>
              </div>
            )}
          </div>

          {/* Map Controls Overlay */}
          {leafletLoaded && (
            <>
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-1 z-[1000]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={zoomIn}
                  className="w-8 h-8 p-0 bg-white shadow-md"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={zoomOut}
                  className="w-8 h-8 p-0 bg-white shadow-md"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetMapView}
                  className="w-8 h-8 p-0 bg-white shadow-md"
                  title="Reset View"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Drawing Status */}
              {isDrawing && (
                <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg border z-[1000]">
                  <div className="text-sm font-medium text-gray-900">Drawing Mode Active</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Click on map to add points • {currentDrawingPoints.length} points added
                  </div>
                  {currentDrawingPoints.length >= 3 && (
                    <div className="text-xs text-green-600 mt-1 font-medium">
                      ✓ Ready to finish polygon (min 3 points)
                    </div>
                  )}
                  {currentDrawingPoints.length >= 12 && (
                    <div className="text-xs text-orange-600 mt-1 font-medium">
                      ⚠ Maximum 12 points reached
                    </div>
                  )}
                </div>
              )}

              {/* Polygon Count */}
              {polygons.length > 0 && (
                <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md border text-xs z-[1000]">
                  <strong>{polygons.length}</strong> polygon{polygons.length !== 1 ? 's' : ''} drawn
                </div>
              )}
            </>
          )}

          {/* Drawing Controls */}
          <div className="flex items-center space-x-3 mt-4">
            <Button
              onClick={startDrawing}
              disabled={isDrawing || isMapLoading}
              variant={isDrawing ? "secondary" : "default"}
              className="flex items-center space-x-2"
            >
              <span>✏️</span>
              <span>{isDrawing ? 'Drawing...' : 'Start Drawing'}</span>
            </Button>

            <Button
              onClick={handleFinishPolygon}
              disabled={!isDrawing || currentDrawingPoints.length < 3}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <span>✅</span>
              <span>Finish Polygon</span>
            </Button>

            {isDrawing && (
              <Button
                onClick={cancelDrawing}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            )}

            <div className="text-sm text-gray-500">
              {isDrawing ? (
                <>Points: {currentDrawingPoints.length}/12</>
              ) : (
                <>Click "Start Drawing" to create polygons</>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>How to use:</strong>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Click "Start Drawing" and then click on the map to add points</li>
              <li>• You need at least 3 points to create a polygon (max 12 points)</li>
              <li>• Click "Finish Polygon" when you're done</li>
              <li>• Click on polygons to see details and delete them</li>
              <li>• Use zoom controls and drag to navigate the map</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
