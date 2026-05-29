export function computeTotal(
  items: Array<{ part_id: string; quantity: number }>,
  prices: Array<{ part_id: string; price: number }>
): number {
  return items.reduce((total, item) => {
    const price = prices.find(p => p.part_id === item.part_id)
    return total + (price?.price ?? 0) * item.quantity
  }, 0)
}
