export interface TimeRange {
  start: Date
  end: Date
  current: Date
}

export interface Polygon {
  id: string
  points: [number, number][]
  dataSource: string
  color: string
  centroid: [number, number]
  boundingBox: {
    north: number
    south: number
    east: number
    west: number
  }
  isComplete: boolean
}

export interface ColorRule {
  operator: '=' | '<' | '>' | '<=' | '>='
  value: number
  color: string
  label: string
}

export interface DataSource {
  id: string
  name: string
  field: string
  fieldDescription: string
  colorRules: ColorRule[]
  apiEndpoint: string
  isActive: boolean
  isRequired?: boolean
}

export interface DashboardState {
  timeRange: TimeRange
  isRangeMode: boolean
  polygons: Polygon[]
  dataSources: DataSource[]
  selectedDataSource: string
  isDrawing: boolean
  currentDrawingPoints: [number, number][]
  mapCenter: [number, number]
  mapZoom: number
  isMapLoading: boolean
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: {
    time: string;
    temperature_2m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}
