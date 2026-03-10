import { prisma } from "../database/prisma.js"

/**
 * Get setting by key
 */
export async function getSettingByKey(key: string): Promise<string | null> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key }
    })
    return setting?.value || null
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error)
    return null
  }
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const settings = await prisma.setting.findMany()
    const settingsMap: Record<string, string> = {}
    settings.forEach((setting: any) => {
      settingsMap[setting.key] = setting.value
    })
    return settingsMap
  } catch (error) {
    console.error("Error getting all settings:", error)
    return {}
  }
}

/**
 * Update or create setting
 */
export async function upsertSetting(key: string, value: string): Promise<boolean> {
  try {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })
    return true
  } catch (error) {
    console.error(`Error upserting setting ${key}:`, error)
    return false
  }
}

/**
 * Update multiple settings
 */
export async function updateSettings(settings: Record<string, string>): Promise<boolean> {
  try {
    const promises = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    )
    await Promise.all(promises)
    return true
  } catch (error) {
    console.error("Error updating settings:", error)
    return false
  }
}

/**
 * Delete setting
 */
export async function deleteSetting(key: string): Promise<boolean> {
  try {
    await prisma.setting.delete({
      where: { key }
    })
    return true
  } catch (error) {
    console.error(`Error deleting setting ${key}:`, error)
    return false
  }
}
