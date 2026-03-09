import { ipcMain } from "electron"
import {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  updateSettings
} from "../services/settings.service.js"

/**
 * Get all settings
 */
ipcMain.handle("settings:get-all", async () => {
  try {
    const settings = await getAllSettings()
    return { success: true, data: settings }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Get setting by key
 */
ipcMain.handle("settings:get", async (_event, key: string) => {
  try {
    const value = await getSettingByKey(key)
    return { success: true, data: value }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Update or create setting
 */
ipcMain.handle("settings:upsert", async (_event, key: string, value: string) => {
  try {
    const success = await upsertSetting(key, value)
    return { success }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Update multiple settings
 */
ipcMain.handle("settings:update-multiple", async (_event, settings: Record<string, string>) => {
  try {
    const success = await updateSettings(settings)
    return { success }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
