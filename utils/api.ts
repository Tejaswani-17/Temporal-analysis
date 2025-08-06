import { WeatherData } from '@/types/dashboard'

export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<WeatherData> {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }
  
  return response.json()
}

export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function calculatePolygonCentroid(points: [number, number][]): [number, number] {
  const x = points.reduce((sum, point) => sum + point[0], 0) / points.length
  const y = points.reduce((sum, point) => sum + point[1], 0) / points.length
  return [x, y]
}

export function calculateBoundingBox(points: [number, number][]) {
  const lats = points.map(p => p[0])
  const lngs = points.map(p => p[1])
  
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs)
  }
}

export function applyColorRules(value: number, rules: any[]): string {
  // Sort rules by value for proper application
  const sortedRules = [...rules].sort((a, b) => a.value - b.value)
  
  for (const rule of sortedRules) {
    switch (rule.operator) {
      case '<':
        if (value < rule.value) return rule.color
        break
      case '<=':
        if (value <= rule.value) return rule.color
        break
      case '>':
        if (value > rule.value) return rule.color
        break
      case '>=':
        if (value >= rule.value) return rule.color
        break
      case '=':
        if (value === rule.value) return rule.color
        break
    }
  }
  
  return '#gray-500' // Default color
}
