import { app, dialog } from "electron"
import fs from "fs"
import path from "path"
import { prisma } from "../database/prisma.js"

export class BackupService {
  private getDatabasePath(): string {
    if (app.isPackaged) {
      return path.join(app.getPath("userData"), "laundry.db")
    }
    return path.join(process.cwd(), "prisma", "laundry.db")
  }

  private getBackupDirectory(): string {
    return path.join(app.getPath("userData"), "backups")
  }

  private ensureBackupDirectory(): void {
    const backupDir = this.getBackupDirectory()
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
  }

  /**
   * Create a backup of the database
   */
  async createBackup(customPath?: string): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      const dbPath = this.getDatabasePath()
      
      // Check if database exists
      if (!fs.existsSync(dbPath)) {
        return { success: false, error: "Database file not found" }
      }

      // Disconnect Prisma to release file lock
      await prisma.$disconnect()

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] + "_" + 
                       (new Date().toTimeString().split(" ")[0] || "00-00-00").replace(/:/g, "-")
      const backupFileName = `laundry_backup_${timestamp}.db`

      let backupPath: string

      if (customPath) {
        // User selected custom location
        backupPath = path.join(customPath, backupFileName)
      } else {
        // Default backup location
        this.ensureBackupDirectory()
        backupPath = path.join(this.getBackupDirectory(), backupFileName)
      }

      // Copy database file
      fs.copyFileSync(dbPath, backupPath)

      // Reconnect Prisma
      await prisma.$connect()

      return { success: true, path: backupPath }
    } catch (error: any) {
      // Reconnect Prisma in case of error
      try {
        await prisma.$connect()
      } catch {}
      
      return { success: false, error: error.message }
    }
  }

  /**
   * Restore database from backup
   */
  async restoreBackup(backupPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if backup file exists
      if (!fs.existsSync(backupPath)) {
        return { success: false, error: "Backup file not found" }
      }

      const dbPath = this.getDatabasePath()

      // Disconnect Prisma to release file lock
      await prisma.$disconnect()

      // Create a backup of current database before restoring
      const currentBackupPath = dbPath + ".before-restore"
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, currentBackupPath)
      }

      // Restore backup
      fs.copyFileSync(backupPath, dbPath)

      // Reconnect Prisma
      await prisma.$connect()

      // Delete the temporary backup
      if (fs.existsSync(currentBackupPath)) {
        fs.unlinkSync(currentBackupPath)
      }

      return { success: true }
    } catch (error: any) {
      // Reconnect Prisma in case of error
      try {
        await prisma.$connect()
      } catch {}
      
      return { success: false, error: error.message }
    }
  }

  /**
   * Get list of available backups
   */
  async listBackups(): Promise<{ success: boolean; backups?: Array<{ name: string; path: string; size: number; date: Date }>; error?: string }> {
    try {
      this.ensureBackupDirectory()
      const backupDir = this.getBackupDirectory()
      
      const files = fs.readdirSync(backupDir)
      const backups = files
        .filter(file => file.endsWith(".db"))
        .map(file => {
          const filePath = path.join(backupDir, file)
          const stats = fs.statSync(filePath)
          return {
            name: file,
            path: filePath,
            size: stats.size,
            date: stats.mtime
          }
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime())

      return { success: true, backups }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Delete a backup file
   */
  async deleteBackup(backupPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!fs.existsSync(backupPath)) {
        return { success: false, error: "Backup file not found" }
      }

      fs.unlinkSync(backupPath)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Export data to CSV
   */
  async exportToCSV(tableName: string, outputPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      let data: any[] = []
      let headers: string[] = []

      switch (tableName) {
        case "customers":
          data = await prisma.customer.findMany()
          headers = ["id", "name", "phone", "address", "notes", "created_at"]
          break
        case "orders":
          data = await prisma.order.findMany({
            include: {
              customer: true,
              items: {
                include: {
                  service: true
                }
              }
            }
          })
          headers = ["id", "order_number", "customer_name", "total_amount", "amount_paid", "balance", "status", "payment_type", "pickup_date", "created_at"]
          break
        case "services":
          data = await prisma.service.findMany()
          headers = ["id", "name", "price", "description", "category"]
          break
        case "expenses":
          data = await prisma.expense.findMany()
          headers = ["id", "title", "amount", "category", "date", "notes", "created_at"]
          break
        case "payments":
          data = await prisma.payment.findMany({
            include: {
              order: {
                include: {
                  customer: true
                }
              }
            }
          })
          headers = ["id", "order_number", "customer_name", "amount", "method", "notes", "created_at"]
          break
        default:
          return { success: false, error: "Invalid table name" }
      }

      // Convert data to CSV
      const csvRows: string[] = []
      csvRows.push(headers.join(","))

      for (const row of data) {
        const values = headers.map(header => {
          let value: any

          if (tableName === "orders" && header === "customer_name") {
            value = (row as any).customer?.name || ""
          } else if (tableName === "payments" && header === "order_number") {
            value = (row as any).order?.order_number || ""
          } else if (tableName === "payments" && header === "customer_name") {
            value = (row as any).order?.customer?.name || ""
          } else {
            value = (row as any)[header]
          }

          // Handle null/undefined
          if (value === null || value === undefined) {
            return ""
          }

          // Escape commas and quotes
          const stringValue = String(value)
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }

          return stringValue
        })

        csvRows.push(values.join(","))
      }

      // Write to file
      fs.writeFileSync(outputPath, csvRows.join("\n"), "utf-8")

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const [
        customerCount,
        orderCount,
        serviceCount,
        paymentCount,
        expenseCount
      ] = await Promise.all([
        prisma.customer.count(),
        prisma.order.count(),
        prisma.service.count(),
        prisma.payment.count(),
        prisma.expense.count()
      ])

      const dbPath = this.getDatabasePath()
      const dbSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0

      return {
        success: true,
        stats: {
          customers: customerCount,
          orders: orderCount,
          services: serviceCount,
          payments: paymentCount,
          expenses: expenseCount,
          databaseSize: dbSize,
          databasePath: dbPath
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

export const backupService = new BackupService()
