"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDashboardStore } from '@/store/dashboard-store'
import { formatCoordinates, calculatePolygonArea } from '@/utils/map-utils'
import { MapPin, Layers, Target } from 'lucide-react'

export function MapInfoPanel() {
  const { mapCenter, polygons, isDrawing, currentDrawingPoints } = useDashboardStore()

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center space-x-2">
          <Target className="w-4 h-4" />
          <span>Map Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Center */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Center:</span>
          <span className="font-mono text-xs">
            {formatCoordinates(mapCenter[0], mapCenter[1])}
          </span>
        </div>

        {/* Drawing Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Drawing:</span>
          <Badge variant={isDrawing ? "default" : "secondary"} className="text-xs">
            {isDrawing ? `Active (${currentDrawingPoints.length} points)` : 'Inactive'}
          </Badge>
        </div>

        {/* Polygon Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Polygons:</span>
          <div className="flex items-center space-x-1">
            <Layers className="w-3 h-3" />
            <span>{polygons.length}</span>
          </div>
        </div>

        {/* Polygon List */}
        {polygons.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs font-medium text-gray-700">Active Polygons:</div>
            {polygons.map((polygon, index) => (
              <div key={polygon.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded border"
                    style={{ backgroundColor: polygon.color }}
                  />
                  <span>Polygon {index + 1}</span>
                </div>
                <div className="text-gray-500">
                  {polygon.points.length} pts
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Drawing Info */}
        {isDrawing && currentDrawingPoints.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs font-medium text-blue-700">Current Drawing:</div>
            <div className="text-xs text-gray-600">
              Points: {currentDrawingPoints.length}/12
            </div>
            {currentDrawingPoints.length >= 3 && (
              <div className="text-xs text-green-600">
                ✓ Ready to complete polygon
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
