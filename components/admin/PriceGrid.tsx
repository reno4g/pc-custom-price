'use client'
import React, { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { upsertPrice } from '@/actions/admin/prices'
import type { Tier, CategoryWithParts } from '@/types/database'

type PriceMap = Record<string, Record<string, number>> // part_id -> tier_id -> price

type Props = {
  categories: CategoryWithParts[]
  tiers: Tier[]
  prices: PriceMap
}

export default function PriceGrid({ categories, tiers, prices: initialPrices }: Props) {
  const [saving, setSaving] = useState<string | null>(null)

  const handleBlur = useCallback(async (
    e: React.FocusEvent<HTMLInputElement>,
    partId: string,
    tierId: string
  ) => {
    const value = Number(e.target.value)
    if (isNaN(value) || value < 0) return
    const key = `${partId}-${tierId}`
    setSaving(key)
    await upsertPrice(partId, tierId, value)
    setSaving(null)
  }, [])

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border rounded-lg">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left px-4 py-3 text-sm font-medium min-w-48">パーツ名</th>
            {tiers.map(tier => (
              <th key={tier.id} className="px-4 py-3 text-sm font-medium text-center min-w-32">
                {tier.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <React.Fragment key={cat.id}>
              <tr className="bg-gray-50 border-b">
                <td colSpan={tiers.length + 1} className="px-4 py-2 text-sm font-semibold text-gray-600">
                  {cat.name}
                </td>
              </tr>
              {cat.parts.map(part => (
                <tr key={part.id} className="border-b last:border-0">
                  <td className="px-4 py-2 text-sm">{part.name}</td>
                  {tiers.map(tier => {
                    const key = `${part.id}-${tier.id}`
                    const currentPrice = initialPrices[part.id]?.[tier.id] ?? 0
                    return (
                      <td key={tier.id} className="px-2 py-1">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">¥</span>
                          <Input
                            type="number"
                            defaultValue={currentPrice}
                            className="pl-6 text-right"
                            min={0}
                            onBlur={e => handleBlur(e, part.id, tier.id)}
                          />
                          {saving === key && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-500">保存中</span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
