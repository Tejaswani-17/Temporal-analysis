"use client"

import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDashboardStore } from '@/store/dashboard-store'
import { Menu, Plus, Trash2 } from 'lucide-react'
import { ColorRule } from '@/types/dashboard'
import { useState } from 'react'

export function DataSourcesSidebar() {
  const {
    dataSources,
    selectedDataSource,
    setSelectedDataSource,
    toggleDataSource,
    updateDataSource
  } = useDashboardStore()

  const [newRule, setNewRule] = useState<Partial<ColorRule>>({
    operator: '<',
    value: 0,
    color: '#3b82f6',
    label: ''
  })

  const activeDataSource = dataSources.find(ds => ds.isActive && ds.id === selectedDataSource)

  const addColorRule = () => {
    if (!activeDataSource || !newRule.operator || newRule.value === undefined || !newRule.color || !newRule.label) return

    const updatedDataSource = {
      ...activeDataSource,
      colorRules: [...activeDataSource.colorRules, newRule as ColorRule]
    }

    updateDataSource(updatedDataSource)
    setNewRule({ operator: '<', value: 0, color: '#3b82f6', label: '' })
  }

  const removeColorRule = (index: number) => {
    if (!activeDataSource) return

    const updatedDataSource = {
      ...activeDataSource,
      colorRules: activeDataSource.colorRules.filter((_, i) => i !== index)
    }

    updateDataSource(updatedDataSource)
  }

  const updateColorRule = (index: number, field: keyof ColorRule, value: any) => {
    if (!activeDataSource) return

    const updatedRules = activeDataSource.colorRules.map((rule, i) =>
      i === index ? { ...rule, [field]: value } : rule
    )

    const updatedDataSource = {
      ...activeDataSource,
      colorRules: updatedRules
    }

    updateDataSource(updatedDataSource)
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-6">
          <Menu className="w-5 h-5 text-gray-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Data Sources & Thresholds</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure data sources and color-coding rules for polygon visualization
            </p>
          </div>
        </div>

        {/* Active Data Sources */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Active:</Label>
          </div>
          
          {dataSources.map((dataSource) => (
            <div key={dataSource.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={dataSource.isActive}
                    onCheckedChange={() => toggleDataSource(dataSource.id)}
                    disabled={dataSource.isRequired}
                  />
                  <div>
                    <div className="font-medium text-sm">{dataSource.name}</div>
                    {dataSource.isRequired && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {dataSource.isActive && (
                <div className="ml-8 space-y-3">
                  {/* Data Field */}
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Data Field</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">{dataSource.field}</div>
                      <div className="text-xs text-gray-600">{dataSource.fieldDescription}</div>
                    </div>
                  </div>

                  {/* Threshold Rules */}
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Threshold Rules</Label>
                    <div className="mt-2 space-y-2">
                      {dataSource.colorRules.map((rule, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full border"
                              style={{ backgroundColor: rule.color }}
                            />
                            <span className="text-sm font-mono">
                              {rule.operator} {rule.value}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeColorRule(index)}
                            className="w-6 h-6 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Add New Rule */}
                    <div className="mt-3 p-3 border border-dashed border-gray-300 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <select
                          value={newRule.operator}
                          onChange={(e) => setNewRule({ ...newRule, operator: e.target.value as any })}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="<">{'<'}</option>
                          <option value="<=">{'<='}</option>
                          <option value="=">=</option>
                          <option value=">=">{'>='}</option>
                          <option value=">">{'>'}</option>
                        </select>
                        
                        <Input
                          type="number"
                          placeholder="Value"
                          value={newRule.value || ''}
                          onChange={(e) => setNewRule({ ...newRule, value: parseFloat(e.target.value) })}
                          className="w-16 h-7 text-xs"
                        />
                        
                        <input
                          type="color"
                          value={newRule.color}
                          onChange={(e) => setNewRule({ ...newRule, color: e.target.value })}
                          className="w-7 h-7 rounded border cursor-pointer"
                        />
                        
                        <Button size="sm" onClick={addColorRule} className="h-7 px-2">
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
