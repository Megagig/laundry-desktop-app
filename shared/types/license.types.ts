// License Types

export interface License {
  id: number
  licenseKey: string
  machineId: string
  issuedTo: string
  email: string | null
  licenseType: LicenseType
  features: string | null
  maxUsers: number
  issuedAt: Date
  expiresAt: Date | null
  activatedAt: Date
  signature: string
  isActive: boolean
}

export type LicenseType = 'TRIAL' | 'ANNUAL' | 'LIFETIME'

export interface LicensePayload {
  product: string
  version: string
  machineId: string
  issuedTo: string
  email: string
  licenseType: LicenseType
  issuedAt: string
  expiresAt: string | null
  features: string[]
  maxUsers: number
  licenseId: string
  vendorId: string
}

export interface LicenseValidationResult {
  valid: boolean
  license?: Omit<License, 'id' | 'activatedAt'>
  error?: string
  details?: string
}

export interface LicenseStatus {
  isActivated: boolean
  isValid: boolean
  isExpired: boolean
  licenseType: string
  expiresAt: Date | null
  daysRemaining: number | null
  features: string[]
  issuedTo: string
  maxUsers: number
}

export interface MachineInfo {
  machineId: string
  platform: string
  arch: string
  hostname: string
  cpuModel: string
  totalMemory: number
  osVersion: string
}

export interface TrialInfo {
  isActive: boolean
  startDate: Date
  endDate: Date
  daysRemaining: number
  isExpired: boolean
}
