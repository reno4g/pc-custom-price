import { getCategoriesWithParts } from '@/actions/parts'
import ConfigBuilder from '@/components/ConfigBuilder'

export default async function Home() {
  const categories = await getCategoriesWithParts()
  return <ConfigBuilder categories={categories} />
}
