/**
 * Get Machine ID for License Testing
 * 
 * This script displays the current machine ID that should be used
 * when creating test licenses.
 */

const { machineIdSync } = require('node-machine-id')
const os = require('os')
const crypto = require('crypto')

function generateMachineId() {
  try {
    // Collect system identifiers (same logic as machine-id.service.ts)
    const identifiers = [
      machineIdSync(), // OS machine ID
      os.hostname(),
      os.platform(),
      os.arch(),
      os.cpus()[0]?.model || '',
    ]
    
    // Create hash
    const hash = crypto
      .createHash('sha256')
      .update(identifiers.join('|'))
      .digest('hex')
    
    // Format: LND-{first 16 chars of hash}
    return `LND-${hash.substring(0, 16).toUpperCase()}`
  } catch (error) {
    console.error('Error generating machine ID:', error)
    return 'LND-ERROR-GENERATING-ID'
  }
}

console.log('🖥️  Machine ID Information\n')

const machineId = generateMachineId()

console.log('Machine ID:', machineId)
console.log('Hostname:', os.hostname())
console.log('Platform:', os.platform())
console.log('Architecture:', os.arch())
console.log('CPU Model:', os.cpus()[0]?.model || 'Unknown')

console.log('\n📋 Usage:')
console.log('1. Copy the Machine ID above')
console.log('2. Update the machineId in create-sample-license.cjs')
console.log('3. Run the license creation script')
console.log('4. Use the generated license keys for testing')

console.log('\n💡 Note:')
console.log('This Machine ID will be used to bind licenses to this specific machine.')
console.log('Licenses created with this Machine ID will only work on this machine.')