const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function testUserAPI() {
  console.log('🧪 Testing User API...\n')

  try {
    // Test 1: Check if users exist in database
    console.log('1️⃣ Testing database users...')
    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    })

    console.log(`  ✓ Users in database: ${users.length}`)
    users.forEach(user => {
      console.log(`    - ${user.username} (${user.role?.name}) - ${user.isActive ? 'Active' : 'Inactive'}`)
    })

    // Test 2: Create a test session for API testing
    console.log('\n2️⃣ Creating test session...')
    const admin = users.find(u => u.username === 'admin')
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

    console.log(`  ✓ Test session created: ${session.id}`)

    // Test 3: Test user service directly
    console.log('\n3️⃣ Testing user service...')
    
    try {
      const { userService } = require('../dist/electron/services/user.service.js')
      
      const allUsers = await userService.getAllUsers()
      console.log(`  ✓ User service getAllUsers: ${allUsers.length} users`)
      
      const adminUser = await userService.getUserById(admin.id)
      console.log(`  ✓ User service getUserById: ${adminUser ? 'Found' : 'Not found'}`)
      
    } catch (serviceError) {
      console.log(`  ✗ User service error: ${serviceError.message}`)
    }

    // Clean up
    await prisma.session.delete({ where: { id: session.id } })
    console.log('\n  ✓ Test session cleaned up')

    console.log('\n✅ User API test completed!')
    console.log('\nIf users show 0 in the UI, check:')
    console.log('1. Session token is being passed correctly')
    console.log('2. User IPC handlers are registered')
    console.log('3. Browser console for API errors')

  } catch (error) {
    console.error('\n❌ User API test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUserAPI()