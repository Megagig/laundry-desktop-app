import sqlite3 from 'sqlite3'
import { promises as fs } from 'fs'
import path from 'path'
import type { LicensePayload } from './crypto.service.js'

export interface StoredLicense {
  id: number
  licenseId: string
  machineId: string
  issuedTo: string
  email: string
  company?: string
  licenseType: string
  features: string
  maxUsers: number
  issuedAt: string
  expiresAt?: string
  product: string
  version: string
  licenseKey: string
  isRevoked: boolean
  revokedAt?: string
  revokedReason?: string
  createdAt: string
  updatedAt: string
}

export interface LicenseStats {
  total: number
  active: number
  expired: number
  revoked: number
  byType: Record<string, number>
  byStatus: Record<string, number>
}

/**
 * Database service for license storage and management
 * Uses SQLite for local license database
 */
export class DatabaseService {
  private readonly DB_PATH = path.join(process.cwd(), 'license-generator.db')
  private db: sqlite3.Database | null = null

  /**
   * Initialize database connection and create tables
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.DB_PATH, (err) => {
        if (err) {
          reject(new Error(`Failed to open database: ${err.message}`))
          return
        }

        // Create licenses table
        this.db!.run(`
          CREATE TABLE IF NOT EXISTS licenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            licenseId TEXT UNIQUE NOT NULL,
            machineId TEXT NOT NULL,
            issuedTo TEXT NOT NULL,
            email TEXT NOT NULL,
            company TEXT,
            licenseType TEXT NOT NULL,
            features TEXT NOT NULL,
            maxUsers INTEGER NOT NULL DEFAULT 1,
            issuedAt TEXT NOT NULL,
            expiresAt TEXT,
            product TEXT NOT NULL,
            version TEXT NOT NULL,
            licenseKey TEXT NOT NULL,
            isRevoked BOOLEAN DEFAULT FALSE,
            revokedAt TEXT,
            revokedReason TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            reject(new Error(`Failed to create table: ${err.message}`))
            return
          }

          // Create indexes for better performance
          this.db!.run(`
            CREATE INDEX IF NOT EXISTS idx_licenses_licenseId ON licenses(licenseId);
            CREATE INDEX IF NOT EXISTS idx_licenses_machineId ON licenses(machineId);
            CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(email);
            CREATE INDEX IF NOT EXISTS idx_licenses_isRevoked ON licenses(isRevoked);
            CREATE INDEX IF NOT EXISTS idx_licenses_licenseType ON licenses(licenseType);
          `, (err) => {
            if (err) {
              reject(new Error(`Failed to create indexes: ${err.message}`))
              return
            }
            resolve()
          })
        })
      })
    })
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }

      this.db.close((err) => {
        if (err) {
          reject(new Error(`Failed to close database: ${err.message}`))
          return
        }
        this.db = null
        resolve()
      })
    })
  }

  /**
   * Store a generated license
   */
  async storeLicense(payload: LicensePayload, licenseKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const stmt = this.db.prepare(`
        INSERT INTO licenses (
          licenseId, machineId, issuedTo, email, company, licenseType,
          features, maxUsers, issuedAt, expiresAt, product, version, licenseKey
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      stmt.run([
        payload.licenseId,
        payload.machineId,
        payload.issuedTo,
        payload.email,
        payload.company || null,
        payload.licenseType,
        payload.features.join(','),
        payload.maxUsers,
        payload.issuedAt,
        payload.expiresAt || null,
        payload.product,
        payload.version,
        licenseKey
      ], function(err) {
        if (err) {
          reject(new Error(`Failed to store license: ${err.message}`))
          return
        }
        resolve()
      })

      stmt.finalize()
    })
  }

  /**
   * Get all licenses
   */
  async getAllLicenses(): Promise<StoredLicense[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      this.db.all(`
        SELECT * FROM licenses 
        ORDER BY createdAt DESC
      `, (err, rows) => {
        if (err) {
          reject(new Error(`Failed to fetch licenses: ${err.message}`))
          return
        }
        resolve(rows as StoredLicense[])
      })
    })
  }

  /**
   * Get license by ID
   */
  async getLicenseById(licenseId: string): Promise<StoredLicense | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      this.db.get(`
        SELECT * FROM licenses WHERE licenseId = ?
      `, [licenseId], (err, row) => {
        if (err) {
          reject(new Error(`Failed to fetch license: ${err.message}`))
          return
        }
        resolve(row as StoredLicense || null)
      })
    })
  }

  /**
   * Get licenses by machine ID
   */
  async getLicensesByMachineId(machineId: string): Promise<StoredLicense[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      this.db.all(`
        SELECT * FROM licenses 
        WHERE machineId = ? 
        ORDER BY createdAt DESC
      `, [machineId], (err, rows) => {
        if (err) {
          reject(new Error(`Failed to fetch licenses: ${err.message}`))
          return
        }
        resolve(rows as StoredLicense[])
      })
    })
  }

  /**
   * Get licenses by email
   */
  async getLicensesByEmail(email: string): Promise<StoredLicense[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      this.db.all(`
        SELECT * FROM licenses 
        WHERE email = ? 
        ORDER BY createdAt DESC
      `, [email], (err, rows) => {
        if (err) {
          reject(new Error(`Failed to fetch licenses: ${err.message}`))
          return
        }
        resolve(rows as StoredLicense[])
      })
    })
  }

  /**
   * Revoke a license
   */
  async revokeLicense(licenseId: string, reason: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      this.db.run(`
        UPDATE licenses 
        SET isRevoked = TRUE, revokedAt = CURRENT_TIMESTAMP, revokedReason = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE licenseId = ?
      `, [reason, licenseId], function(err) {
        if (err) {
          reject(new Error(`Failed to revoke license: ${err.message}`))
          return
        }
        
        if (this.changes === 0) {
          reject(new Error('License not found'))
          return
        }
        
        resolve()
      })
    })
  }

  /**
   * Extend license expiry
   */
  async extendLicense(licenseId: string, newExpiryDate: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      this.db.run(`
        UPDATE licenses 
        SET expiresAt = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE licenseId = ?
      `, [newExpiryDate, licenseId], function(err) {
        if (err) {
          reject(new Error(`Failed to extend license: ${err.message}`))
          return
        }
        
        if (this.changes === 0) {
          reject(new Error('License not found'))
          return
        }
        
        resolve()
      })
    })
  }

  /**
   * Get license statistics
   */
  async getLicenseStats(): Promise<LicenseStats> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      this.db.all(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN isRevoked = FALSE AND (expiresAt IS NULL OR expiresAt > datetime('now')) THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN expiresAt IS NOT NULL AND expiresAt <= datetime('now') AND isRevoked = FALSE THEN 1 ELSE 0 END) as expired,
          SUM(CASE WHEN isRevoked = TRUE THEN 1 ELSE 0 END) as revoked,
          licenseType,
          CASE 
            WHEN isRevoked = TRUE THEN 'revoked'
            WHEN expiresAt IS NOT NULL AND expiresAt <= datetime('now') THEN 'expired'
            ELSE 'active'
          END as status
        FROM licenses
        GROUP BY licenseType, status
      `, (err, rows: any[]) => {
        if (err) {
          reject(new Error(`Failed to fetch statistics: ${err.message}`))
          return
        }

        // Process results
        const stats: LicenseStats = {
          total: 0,
          active: 0,
          expired: 0,
          revoked: 0,
          byType: {},
          byStatus: {}
        }

        // Get totals first
        this.db!.get(`SELECT COUNT(*) as total FROM licenses`, (err, totalRow: any) => {
          if (err) {
            reject(new Error(`Failed to fetch total count: ${err.message}`))
            return
          }

          stats.total = totalRow.total

          // Get counts by status
          this.db!.all(`
            SELECT 
              SUM(CASE WHEN isRevoked = FALSE AND (expiresAt IS NULL OR expiresAt > datetime('now')) THEN 1 ELSE 0 END) as active,
              SUM(CASE WHEN expiresAt IS NOT NULL AND expiresAt <= datetime('now') AND isRevoked = FALSE THEN 1 ELSE 0 END) as expired,
              SUM(CASE WHEN isRevoked = TRUE THEN 1 ELSE 0 END) as revoked
            FROM licenses
          `, (err, statusRows: any[]) => {
            if (err) {
              reject(new Error(`Failed to fetch status counts: ${err.message}`))
              return
            }

            if (statusRows.length > 0) {
              stats.active = statusRows[0].active || 0
              stats.expired = statusRows[0].expired || 0
              stats.revoked = statusRows[0].revoked || 0
            }

            // Get counts by type
            this.db!.all(`
              SELECT licenseType, COUNT(*) as count
              FROM licenses
              GROUP BY licenseType
            `, (err, typeRows: any[]) => {
              if (err) {
                reject(new Error(`Failed to fetch type counts: ${err.message}`))
                return
              }

              typeRows.forEach(row => {
                stats.byType[row.licenseType] = row.count
              })

              // Get counts by status
              this.db!.all(`
                SELECT 
                  CASE 
                    WHEN isRevoked = TRUE THEN 'revoked'
                    WHEN expiresAt IS NOT NULL AND expiresAt <= datetime('now') THEN 'expired'
                    ELSE 'active'
                  END as status,
                  COUNT(*) as count
                FROM licenses
                GROUP BY status
              `, (err, statusCountRows: any[]) => {
                if (err) {
                  reject(new Error(`Failed to fetch status counts: ${err.message}`))
                  return
                }

                statusCountRows.forEach(row => {
                  stats.byStatus[row.status] = row.count
                })

                resolve(stats)
              })
            })
          })
        })
      })
    })
  }

  /**
   * Search licenses
   */
  async searchLicenses(query: string): Promise<StoredLicense[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const searchPattern = `%${query}%`

      this.db.all(`
        SELECT * FROM licenses 
        WHERE 
          licenseId LIKE ? OR
          issuedTo LIKE ? OR
          email LIKE ? OR
          company LIKE ? OR
          machineId LIKE ?
        ORDER BY createdAt DESC
      `, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern], (err, rows) => {
        if (err) {
          reject(new Error(`Failed to search licenses: ${err.message}`))
          return
        }
        resolve(rows as StoredLicense[])
      })
    })
  }

  /**
   * Delete license (permanent)
   */
  async deleteLicense(licenseId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      this.db.run(`
        DELETE FROM licenses WHERE licenseId = ?
      `, [licenseId], function(err) {
        if (err) {
          reject(new Error(`Failed to delete license: ${err.message}`))
          return
        }
        
        if (this.changes === 0) {
          reject(new Error('License not found'))
          return
        }
        
        resolve()
      })
    })
  }

  /**
   * Export all licenses to JSON
   */
  async exportLicenses(): Promise<string> {
    const licenses = await this.getAllLicenses()
    const stats = await this.getLicenseStats()

    const exportData = {
      exportDate: new Date().toISOString(),
      statistics: stats,
      licenses: licenses.map(license => ({
        ...license,
        // Remove sensitive license key from export
        licenseKey: '***REDACTED***'
      }))
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Backup database file
   */
  async backupDatabase(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(process.cwd(), `license-generator-backup-${timestamp}.db`)
    
    await fs.copyFile(this.DB_PATH, backupPath)
    
    return backupPath
  }
}

export const databaseService = new DatabaseService()