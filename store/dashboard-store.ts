import { create } from 'zustand'
import { DashboardState, Polygon, DataSource, TimeRange } from '@/types/dashboard'

interface DashboardStore extends DashboardState {
  setTimeRange: (timeRange: TimeRange) => void
  setRangeMode: (isRangeMode: boolean) => void
  addPolygon: (polygon: Polygon) => void
  removePolygon: (id: string) => void
  updatePolygonColor: (id: string, color: string) => void
  setSelectedDataSource: (id: string) => void
  updateDataSource: (dataSource: DataSource) => void
  toggleDataSource: (id: string) => void
  setDrawing: (isDrawing: boolean) => void
  addDrawingPoint: (point: [number, number]) => void
  clearDrawingPoints: () => void
  finishPolygon: () => void
  setMapCenter: (center: [number, number]) => void
  setMapLoading: (loading: boolean) => void
  setMapZoom: (zoom: number) => void
  updatePolygonFromMap: (polygon: Polygon) => void
}

const defaultDataSources: DataSource[] = [
  {
    id: 'open-meteo-weather',
    name: 'Open-Meteo Weather',
    field: 'temperature_2m',
    fieldDescription: '2m above ground temperature',
    isActive: true,
    isRequired: true,
    colorRules: [
      { operator: '<', value: 10, color: '#3b82f6', label: '< 10' },
      { operator: '<', value: 25, color: '#f59e0b', label: '< 25' },
      { operator: '>=', value: 25, color: '#ef4444', label: '≥ 25' }
    ],
    apiEndpoint: 'https://archive-api.open-meteo.com/v1/archive'
  },
  {
    id: 'traffic-data',
    name: 'Traffic Data',
    field: 'traffic_density',
    fieldDescription: 'Real-time traffic density',
    isActive: false,
    colorRules: [
      { operator: '<', value: 30, color: '#22c55e', label: 'Low' },
      { operator: '<', value: 70, color: '#f59e0b', label: 'Medium' },
      { operator: '>=', value: 70, color: '#ef4444', label: 'High' }
    ],
    apiEndpoint: '/api/traffic'
  },
  {
    id: 'environmental-sensors',
    name: 'Environmental Sensors',
    field: 'air_quality',
    fieldDescription: 'Air quality index',
    isActive: false,
    colorRules: [
      { operator: '<', value: 50, color: '#22c55e', label: 'Good' },
      { operator: '<', value: 100, color: '#f59e0b', label: 'Moderate' },
      { operator: '>=', value: 100, color: '#ef4444', label: 'Poor' }
    ],
    apiEndpoint: '/api/environmental'
  }
]

const now = new Date()
const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0)

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  timeRange: {
    start: new Date(currentHour.getTime() - 15 * 24 * 60 * 60 * 1000),
    end: new Date(currentHour.getTime() + 15 * 24 * 60 * 60 * 1000),
    current: currentHour
  },
  isRangeMode: false,
  polygons: [],
  dataSources: defaultDataSources,
  selectedDataSource: 'open-meteo-weather',
  isDrawing: false,
  currentDrawingPoints: [],
  mapCenter: [52.528, 13.41],
  mapZoom: 10,
  isMapLoading: true,

  setTimeRange: (timeRange) => set({ timeRange }),
  setRangeMode: (isRangeMode) => set({ isRangeMode }),
  addPolygon: (polygon) => set((state) => ({ 
    polygons: [...state.polygons, polygon] 
  })),
  removePolygon: (id) => set((state) => ({ 
    polygons: state.polygons.filter(p => p.id !== id) 
  })),
  updatePolygonColor: (id, color) => set((state) => ({
    polygons: state.polygons.map(p => p.id === id ? { ...p, color } : p)
  })),
  setSelectedDataSource: (id) => set({ selectedDataSource: id }),
  updateDataSource: (dataSource) => set((state) => ({
    dataSources: state.dataSources.map(ds => 
      ds.id === dataSource.id ? dataSource : ds
    )
  })),
  toggleDataSource: (id) => set((state) => ({
    dataSources: state.dataSources.map(ds =>
      ds.id === id ? { ...ds, isActive: !ds.isActive } : ds
    )
  })),
  setDrawing: (isDrawing) => set({ isDrawing }),
  addDrawingPoint: (point) => set((state) => ({
    currentDrawingPoints: [...state.currentDrawingPoints, point]
  })),
  clearDrawingPoints: () => set({ currentDrawingPoints: [] }),
  finishPolygon: () => {
    const state = get()
    if (state.currentDrawingPoints.length >= 3) {
      const points = state.currentDrawingPoints
      
      // Calculate centroid
      const centroid: [number, number] = [
        points.reduce((sum, p) => sum + p[0], 0) / points.length,
        points.reduce((sum, p) => sum + p[1], 0) / points.length
      ]
      
      // Calculate bounding box
      const lats = points.map(p => p[0])
      const lngs = points.map(p => p[1])
      const boundingBox = {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs)
      }
      
      const activeDataSource = state.dataSources.find(ds => ds.isActive && ds.id === state.selectedDataSource)
      const defaultColor = activeDataSource?.colorRules[0]?.color || '#3b82f6'
      
      const newPolygon: Polygon = {
        id: `polygon-${Date.now()}`,
        points: [...points],
        dataSource: state.selectedDataSource,
        color: defaultColor,
        centroid,
        boundingBox,
        isComplete: true
      }
      
      set((state) => ({
        polygons: [...state.polygons, newPolygon],
        currentDrawingPoints: [],
        isDrawing: false
      }))
    }
  },
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapLoading: (loading) => set({ isMapLoading: loading }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  updatePolygonFromMap: (polygon) => set((state) => ({
    polygons: state.polygons.map(p => p.id === polygon.id ? polygon : p)
  }))
}))
