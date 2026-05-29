'use server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { CategoryWithParts } from '@/types/database'

export async function getCategoriesWithParts(): Promise<CategoryWithParts[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('part_categories')
    .select('*, parts(*)')
    .order('sort_order')
    .order('sort_order', { referencedTable: 'parts' })
  return (data ?? []) as CategoryWithParts[]
}
