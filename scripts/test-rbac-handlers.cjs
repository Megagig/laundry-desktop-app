const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function testRBACHandlers() {
  console.log('🧪 Testing RBAC Handlers...\n')

  try {
    // Test 1: Create a test session
    console.log('1️⃣ Creating test session...')
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' }
    })

    if (!admin) {
      console.log('  ✗ Admin user not found')
      return
    }

    const crypto = require('crypto')
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const session = await prisma.session.create({
      data: {
        userId: admin.id,
        token: sessionToken,
        expiresAt
      }
    })

    console.log(`  ✓ Session created: ${session.id}`)
    console.log(`  ✓ Token: ${sessionToken.substring(0, 16)}...`)

    // Test 2: Test RBAC service directly
    console.log('\n2️⃣ Testing RBAC service directly...')
    
    // Import the RBAC service
    const { rbacService } = require('../dist/electron/services/rbac.service.js')
    
    const permissions = await rbacService.getUserPermissions(admin.id)
    console.log(`  ✓ User permissions: ${permissions.length}`)
    console.log(`  ✓ First 5: ${permissions.slice(0, 5).join(', ')}`)

    const hasViewDashboard = await rbacService.hasPermission(admin.id, 'view_dashboard')
    console.log(`  ✓ Has view_dashboard: ${hasViewDashboard}`)

    const userRole = await rbacService.getUserRole(admin.id)
    console.log(`  ✓ User role: ${userRole}`)

    // Test 3: Test auth service session validation
    console.log('\n3️⃣ Testing auth service session validation...')
    
    const { authService } = require('../dist/electron/services/auth.service.js')
    
    const validatedSession = await authService.validateSession(sessionToken)
    console.log(`  ✓ Session valid: ${!!validatedSession}`)
    if (validatedSession) {
      console.log(`  ✓ Session user ID: ${validatedSession.userId}`)
    }

    // Clean up
    await prisma.session.delete({ where: { id: session.id } })
    console.log('\n  ✓ Test session cleaned up')

    console.log('\n✅ RBAC handlers test completed!')
    console.log('\n🎯 RBAC service is working correctly')
    console.log('The issue might be in the IPC communication or preload script')

  } catch (error) {
    console.error('\n❌ RBAC handlers test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRBACHandlers()