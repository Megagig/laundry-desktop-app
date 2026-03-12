#!/usr/bin/env node

/**
 * Format Machine ID for License Generation
 */

const crypto = require('crypto')

function formatMachineId(rawId) {
  // Take first 8 characters of the hash and format as LND-XXXXXXXX
  const shortId = rawId.substring(0, 8).toUpperCase()
  return `LND-${shortId}`
}

const rawMachineId = 'e01f56f77a68875ee489a98e98eb1cb4'
const formattedId = formatMachineId(rawMachineId)

console.log('🎫 FORMATTED MACHINE ID FOR LICENSE GENERATOR:')
console.log(`\x1b[32m${formattedId}\x1b[0m`)
console.log('\n📝 Use this formatted Machine ID in the license generator.')