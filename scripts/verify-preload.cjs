const fs = require('fs')
const path = require('path')

console.log('🔍 Verifying Preload Script...\n')

// Check if preload file exists
const preloadPath = path.join(__dirname, '../dist/electron/preload.cjs')
if (!fs.existsSync(preloadPath)) {
  console.log('❌ Preload file not found at:', preloadPath)
  process.exit(1)
}

console.log('✅ Preload file exists')

// Read and check content
const content = fs.readFileSync(preloadPath, 'utf8')

// Check for RBAC APIs
const hasRBACAPIs = content.includes('rbac:')
console.log(`${hasRBACAPIs ? '✅' : '❌'} RBAC APIs found in preload: ${hasRBACAPIs}`)

if (hasRBACAPIs) {
  const rbacMethods = [
    'getUserPermissions',
    'hasPermission',
    'getRoles',
    'getPermissions',
    'getUserRole'
  ]
  
  rbacMethods.forEach(method => {
    const hasMethod = content.includes(method)
    console.log(`  ${hasMethod ? '✅' : '❌'} ${method}: ${hasMethod}`)
  })
}

// Check for auth APIs
const hasAuthAPIs = content.includes('auth:')
console.log(`${hasAuthAPIs ? '✅' : '❌'} Auth APIs found in preload: ${hasAuthAPIs}`)

// Check file size
const stats = fs.statSync(preloadPath)
console.log(`📊 Preload file size: ${stats.size} bytes`)

console.log('\n🎯 Preload verification complete')