import { describe, it, expect } from 'vitest'
import { computeTotal } from './price'

describe('computeTotal', () => {
  it('returns 0 for empty items', () => {
    expect(computeTotal([], [])).toBe(0)
  })
  it('calculates single item', () => {
    expect(computeTotal(
      [{ part_id: 'a', quantity: 1 }],
      [{ part_id: 'a', price: 50000 }]
    )).toBe(50000)
  })
  it('multiplies by quantity', () => {
    expect(computeTotal(
      [{ part_id: 'a', quantity: 2 }],
      [{ part_id: 'a', price: 18000 }]
    )).toBe(36000)
  })
  it('sums multiple items', () => {
    expect(computeTotal(
      [{ part_id: 'a', quantity: 1 }, { part_id: 'b', quantity: 2 }],
      [{ part_id: 'a', price: 50000 }, { part_id: 'b', price: 18000 }]
    )).toBe(86000)
  })
  it('skips items with no matching price', () => {
    expect(computeTotal(
      [{ part_id: 'a', quantity: 1 }],
      []
    )).toBe(0)
  })
})
