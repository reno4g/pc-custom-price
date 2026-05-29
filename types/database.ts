export interface PartCategory {
  id: string
  name: string
  max_quantity: number
  sort_order: number
}

export interface Part {
  id: string
  category_id: string
  name: string
  spec: string | null
  is_active: boolean
  sort_order: number
}

export interface Tier {
  id: string
  name: string
  description: string | null
}

export interface PartPrice {
  id: string
  part_id: string
  tier_id: string
  price: number
}

export interface Profile {
  id: string
  tier_id: string | null
  company_name: string
  is_admin: boolean
}

export interface Configuration {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface ConfigurationItem {
  id: string
  configuration_id: string
  part_id: string
  quantity: number
}

// Composite types
export interface CategoryWithParts extends PartCategory {
  parts: Part[]
}

export interface ConfigItemWithPart extends ConfigurationItem {
  parts: Part
}

export interface ConfigurationWithItems extends Configuration {
  configuration_items: ConfigItemWithPart[]
}
