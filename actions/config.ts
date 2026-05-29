'use server'
import type { ConfigItem } from './price'

export async function saveConfig(_name: string, _items: ConfigItem[]): Promise<void> {
  // implemented in Task 8
  throw new Error('Not yet implemented')
}

export async function listConfigs() {
  return []
}

export async function getConfig(_id: string) {
  return null
}

export async function deleteConfig(_id: string) {}
