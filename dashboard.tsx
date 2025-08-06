"use client"

import { DataSourcesSidebar } from './components/data-sources-sidebar'
import { TimelineControl } from './components/timeline-control'
import { InteractiveMap } from './components/interactive-map'
import { MapInfoPanel } from './components/map-info-panel'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <DataSourcesSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Real-time Spatio-Temporal Analysis
          </h1>
          <p className="text-gray-600">
            Interactive timeline and spatial analysis with immediate data visualization and color-coded insights
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 space-y-6">
          {/* Timeline Control */}
          <TimelineControl />
          
          {/* Interactive Map and Info Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <InteractiveMap />
            </div>
            <div className="lg:col-span-1">
              <MapInfoPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
