const fs = require('fs')
const path = require('path')

console.log('🔍 Debugging RBAC API Issues...\n')

// Check if built files exist
const preloadPath = path.join(__dirname, '../dist/electron/preload.cjs')
const mainPath = path.join(__dirname, '../dist/electron/main.js')
const rbacServicePath = path.join(__dirname, '../dist/electron/services/rbac.service.js')
const rbacIpcPath = path.join(__dirname, '../dist/electron/ipc/rbac.ipc.js')

console.log('1️⃣ Checking built files...')
console.log(`  Preload: ${fs.existsSync(preloadPath) ? '✅' : '❌'}`)
console.log(`  Main: ${fs.existsSync(mainPath) ? '✅' : '❌'}`)
console.log(`  RBAC Service: ${fs.existsSync(rbacServicePath) ? '✅' : '❌'}`)
console.log(`  RBAC IPC: ${fs.existsSync(rbacIpcPath) ? '✅' : '❌'}`)

// Check preload content
if (fs.existsSync(preloadPath)) {
  console.log('\n2️⃣ Checking preload content...')
  const preloadContent = fs.readFileSync(preloadPath, 'utf8')
  
  const hasRbacSection = preloadContent.includes('rbac:')
  console.log(`  RBAC section: ${hasRbacSection ? '✅' : '❌'}`)
  
  if (hasRbacSection) {
    const rbacMethods = [
      'getUserPermissions',
      'hasPermission',
      'getRoles',
      'getPermissions',
      'getUserRole'
    ]
    
    rbacMethods.forEach(method => {
      const hasMethod = preloadContent.includes(method)
      console.log(`    ${method}: ${hasMethod ? '✅' : '❌'}`)
    })
  }
}

// Check main.js for RBAC import
if (fs.existsSync(mainPath)) {
  console.log('\n3️⃣ Checking main.js for RBAC import...')
  const mainContent = fs.readFileSync(mainPath, 'utf8')
  
  const hasRbacImport = mainContent.includes('rbac.ipc')
  console.log(`  RBAC IPC import: ${hasRbacImport ? '✅' : '❌'}`)
}

// Check RBAC service
if (fs.existsSync(rbacServicePath)) {
  console.log('\n4️⃣ Checking RBAC service...')
  const rbacContent = fs.readFileSync(rbacServicePath, 'utf8')
  
  const hasGetUserPermissions = rbacContent.includes('getUserPermissions')
  const hasRbacServiceExport = rbacContent.includes('rbacService')
  
  console.log(`  getUserPermissions method: ${hasGetUserPermissions ? '✅' : '❌'}`)
  console.log(`  rbacService export: ${hasRbacServiceExport ? '✅' : '❌'}`)
}

// Check RBAC IPC handlers
if (fs.existsSync(rbacIpcPath)) {
  console.log('\n5️⃣ Checking RBAC IPC handlers...')
  const rbacIpcContent = fs.readFileSync(rbacIpcPath, 'utf8')
  
  const handlers = [
    'rbac:get-user-permissions',
    'rbac:has-permission',
    'rbac:get-roles',
    'rbac:get-permissions',
    'rbac:get-user-role'
  ]
  
  handlers.forEach(handler => {
    const hasHandler = rbacIpcContent.includes(handler)
    console.log(`    ${handler}: ${hasHandler ? '✅' : '❌'}`)
  })
}

console.log('\n🎯 Debug complete!')
console.log('\nIf all checks pass, the issue might be:')
console.log('1. Electron app not restarting properly')
console.log('2. Browser cache in development mode')
console.log('3. IPC communication issue')
console.log('\nTry:')
console.log('- Completely close and restart the Electron app')
console.log('- Clear browser cache if using dev mode')
console.log('- Check browser console for detailed error messages')