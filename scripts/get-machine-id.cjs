#!/usr/bin/env node

/**
 * Get Machine ID for License Generation
 * This script extracts the machine ID that will be used for license binding
 */

const { machineIdService } = require('../dist/electron/services/machine-id.service.js')

async function getMachineId() {
  try {
    console.log('🔍 Getting Machine ID for license generation...\n')
    
    const machineId = await machineIdService.getMachineId()
    const machineInfo = await machineIdService.getMachineInfo()
    
    console.log('📋 MACHINE INFORMATION:')
    console.log('=' .repeat(50))
    console.log(`Machine ID: ${machineId}`)
    console.log(`Platform: ${machineInfo.platform} (${machineInfo.arch})`)
    console.log(`Hostname: ${machineInfo.hostname}`)
    console.log(`CPU: ${machineInfo.cpuModel}`)
    console.log(`Memory: ${(machineInfo.totalMemory / (1024 * 1024 * 1024)).toFixed(1)} GB`)
    console.log(`OS: ${machineInfo.osVersion}`)
    console.log('=' .repeat(50))
    
    console.log('\n🎫 USE THIS MACHINE ID FOR LICENSE GENERATION:')
    console.log(`\x1b[32m${machineId}\x1b[0m`)
    console.log('\n📝 Copy the green Machine ID above and use it in the license generator.')
    
  } catch (error) {
    console.error('❌ Failed to get machine ID:', error.message)
    
    // Fallback method
    console.log('\n🔄 Trying fallback method...')
    try {
      const fallbackId = machineIdService.generateFallbackId()
      console.log(`\n🎫 FALLBACK MACHINE ID:`)
      console.log(`\x1b[32m${fallbackId}\x1b[0m`)
    } catch (fallbackError) {
      console.error('❌ Fallback method also failed:', fallbackError.message)
    }
  }
}

getMachineId()