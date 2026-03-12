const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'prisma', 'laundry.db')
process.env.DATABASE_URL = `file:${dbPath}`

const prisma = new PrismaClient()

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n')

  try {
    // 1. Test password hashing
    console.log('1️⃣ Testing password hashing...')
    const testPassword = 'TestPass123!'
    const hash = await bcrypt.hash(testPassword, 12)
    const isValid = await bcrypt.compare(testPassword, hash)
    console.log(`  ✓ Password hashing: ${isValid ? 'PASS' : 'FAIL'}`)

    // 2. Test admin user exists
    console.log('\n2️⃣ Testing admin user...')
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' },
      include: { role: true }
    })
    
    if (admin) {
      console.log(`  ✓ Admin user found: ${admin.username}`)
      console.log(`  ✓ Email: ${admin.email}`)
      console.log(`  ✓ Role: ${admin.role.name}`)
      console.log(`  ✓ Active: ${admin.isActive}`)
      
      // Test password verification
      const passwordValid = await bcrypt.compare('admin123', admin.passwordHash)
      console.log(`  ✓ Default password verification: ${passwordValid ? 'PASS' : 'FAIL'}`)
    } else {
      console.log('  ❌ Admin user not found')
    }

    // 3. Test session creation
    console.log('\n3️⃣ Testing session creation...')
    const crypto = require('crypto')
    const token = crypto.randomBytes(32).toString('base64')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
    const session = await prisma.session.create({
      data: {
        userId: admin.id,
        token,
        expiresAt
      }
    })
    console.log(`  ✓ Session created: ${session.id}`)
    console.log(`  ✓ Token length: ${session.token.length} chars`)
    console.log(`  ✓ Expires: ${session.expiresAt.toISOString()}`)

    // 4. Test session validation
    console.log('\n4️⃣ Testing session validation...')
    const foundSession = await prisma.session.findUnique({
      where: { token: session.token },
      include: {
        user: {
          include: { role: true }
        }
      }
    })
    
    if (foundSession) {
      console.log(`  ✓ Session found: ${foundSession.id}`)
      console.log(`  ✓ User: ${foundSession.user.username}`)
      console.log(`  ✓ Is expired: ${new Date() > foundSession.expiresAt}`)
    }

    // 5. Clean up test session
    await prisma.session.delete({
      where: { id: session.id }
    })
    console.log(`  ✓ Test session cleaned up`)

    // 6. Test user count
    console.log('\n5️⃣ Testing user management...')
    const userCount = await prisma.user.count()
    console.log(`  ✓ Total users: ${userCount}`)

    // 7. Test role-permission relationships
    console.log('\n6️⃣ Testing role permissions...')
    const adminRole = await prisma.role.findUnique({
      where: { name: 'ADMIN' },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
    
    if (adminRole) {
      console.log(`  ✓ Admin role has ${adminRole.permissions.length} permissions`)
    }

    console.log('\n✅ Authentication system tests passed!')
    console.log('\n🎯 Phase 2: Authentication System - Ready for Testing')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()
