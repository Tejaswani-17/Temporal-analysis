"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useDashboardStore } from '@/store/dashboard-store'
import { ColorRule, DataSource } from '@/types/dashboard'
import { Trash2, Plus } from 'lucide-react'

export function Sidebar() {
  const {
    dataSources,
    selectedDataSource,
    setSelectedDataSource,
    updateDataSource,
    polygons
  } = useDashboardStore()

  const [newRule, setNewRule] = useState<Partial<ColorRule>>({
    operator: '<',
    value: 0,
    color: '#ef4444'
  })

  const currentDataSource = dataSources.find(ds => ds.id === selectedDataSource)

  const addColorRule = () => {
    if (!currentDataSource || !newRule.operator || newRule.value === undefined || !newRule.color) return

    const updatedDataSource: DataSource = {
      ...currentDataSource,
      colorRules: [...currentDataSource.colorRules, newRule as ColorRule]
    }

    updateDataSource(updatedDataSource)
    setNewRule({ operator: '<', value: 0, color: '#ef4444' })
  }

  const removeColorRule = (index: number) => {
    if (!currentDataSource) return

    const updatedDataSource: DataSource = {
      ...currentDataSource,
      colorRules: currentDataSource.colorRules.filter((_, i) => i !== index)
    }

    updateDataSource(updatedDataSource)
  }

  const updateColorRule = (index: number, field: keyof ColorRule, value: any) => {
    if (!currentDataSource) return

    const updatedRules = currentDataSource.colorRules.map((rule, i) =>
      i === index ? { ...rule, [field]: value } : rule
    )

    const updatedDataSource: DataSource = {
      ...currentDataSource,
      colorRules: updatedRules
    }

    updateDataSource(updatedDataSource)
  }

  return (
    <Card className="w-80 h-fit">
      <CardHeader>
        <CardTitle>Data Sources & Color Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Source Selection */}
        <div className="space-y-2">
          <Label>Data Source</Label>
          <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dataSources.map((ds) => (
                <SelectItem key={ds.id} value={ds.id}>
                  {ds.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentDataSource && (
          <>
            {/* Field Information */}
            <div className="space-y-2">
              <Label>Field</Label>
              <div className="p-2 bg-gray-50 rounded text-sm">
                {currentDataSource.field}
              </div>
            </div>

            {/* Color Rules */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Color Rules</Label>
              
              {/* Existing Rules */}
              <div className="space-y-2">
                {currentDataSource.colorRules.map((rule, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                    <Select
                      value={rule.operator}
                      onValueChange={(value) => updateColorRule(index, 'operator', value)}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<">{'<'}</SelectItem>
                        <SelectItem value="<=">{'<='}</SelectItem>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value=">=">{'>='}</SelectItem>
                        <SelectItem value=">">{'>'}</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="number"
                      value={rule.value}
                      onChange={(e) => updateColorRule(index, 'value', parseFloat(e.target.value))}
                      className="w-20"
                    />
                    
                    <input
                      type="color"
                      value={rule.color}
                      onChange={(e) => updateColorRule(index, 'color', e.target.value)}
                      className="w-10 h-8 rounded border"
                    />
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeColorRule(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add New Rule */}
              <div className="space-y-2 p-3 border-2 border-dashed border-gray-300 rounded">
                <Label className="text-sm">Add New Rule</Label>
                <div className="flex items-center space-x-2">
                  <Select
                    value={newRule.operator}
                    onValueChange={(value) => setNewRule({ ...newRule, operator: value as any })}
                  >
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<">{'<'}</SelectItem>
                      <SelectItem value="<=">{'<='}</SelectItem>
                      <SelectItem value="=">=</SelectItem>
                      <SelectItem value=">=">{'>='}</SelectItem>
                      <SelectItem value=">">{'>'}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    placeholder="Value"
                    value={newRule.value || ''}
                    onChange={(e) => setNewRule({ ...newRule, value: parseFloat(e.target.value) })}
                    className="w-20"
                  />
                  
                  <input
                    type="color"
                    value={newRule.color}
                    onChange={(e) => setNewRule({ ...newRule, color: e.target.value })}
                    className="w-10 h-8 rounded border"
                  />
                  
                  <Button size="sm" onClick={addColorRule}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Rule Preview */}
            <div className="space-y-2">
              <Label>Rule Preview</Label>
              <div className="space-y-1">
                {currentDataSource.colorRules.map((rule, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: rule.color }}
                    />
                    <span>
                      Value {rule.operator} {rule.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Polygon Summary */}
        <div className="space-y-2">
          <Label>Active Polygons</Label>
          <div className="space-y-1">
            {polygons.length === 0 ? (
              <div className="text-sm text-gray-500">No polygons drawn</div>
            ) : (
              polygons.map((polygon) => (
                <div key={polygon.id} className="flex items-center space-x-2 text-sm">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: polygon.color }}
                  />
                  <span>Polygon {polygon.id.split('-')[1]}</span>
                  <Badge variant="secondary" className="text-xs">
                    {polygon.points.length} pts
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
