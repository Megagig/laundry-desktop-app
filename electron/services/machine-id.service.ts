import { platform, arch, hostname, cpus, totalmem, release } from 'os'
import { createHash } from 'crypto'
import type { MachineInfo } from '../../shared/types/license.types.js'

export class MachineIdService {
  private cachedMachineId: string | null = null
  private cachedMachineInfo: MachineInfo | null = null

  /**
   * Get unique machine identifier
   */
  async getMachineId(): Promise<string> {
    if (this.cachedMachineId) {
      return this.cachedMachineId
    }

    try {
      // Try to import node-machine-id with CommonJS syntax
      const machineId = require('node-machine-id')
      const id = machineId.machineIdSync()
      this.cachedMachineId = id
      return id
    } catch (error) {
      console.error('Failed to get machine ID from node-machine-id:', error)
      // Fallback to a combination of system info
      const fallbackId = this.generateFallbackId()
      this.cachedMachineId = fallbackId
      return fallbackId
    }
  }

  /**
   * Get comprehensive machine information
   */
  async getMachineInfo(): Promise<MachineInfo> {
    if (this.cachedMachineInfo) {
      return this.cachedMachineInfo
    }

    const machineId = await this.getMachineId()
    const cpuInfo = cpus()[0]

    this.cachedMachineInfo = {
      machineId,
      platform: platform(),
      arch: arch(),
      hostname: hostname(),
      cpuModel: cpuInfo?.model || 'Unknown',
      totalMemory: totalmem(),
      osVersion: release()
    }

    return this.cachedMachineInfo
  }

  /**
   * Generate fallback machine ID when node-machine-id fails
   */
  private generateFallbackId(): string {
    const systemInfo = [
      platform(),
      arch(),
      hostname(),
      cpus()[0]?.model || '',
      totalmem().toString(),
      release()
    ].join('|')

    return createHash('sha256')
      .update(systemInfo)
      .digest('hex')
      .substring(0, 32)
  }

  /**
   * Validate if current machine matches expected machine ID
   */
  async validateMachine(expectedMachineId: string): Promise<boolean> {
    const currentMachineId = await this.getMachineId()
    return currentMachineId === expectedMachineId
  }

  /**
   * Clear cached values (useful for testing)
   */
  clearCache(): void {
    this.cachedMachineId = null
    this.cachedMachineInfo = null
  }
}

export const machineIdService = new MachineIdService()