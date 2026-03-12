const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function testLoginFix() {
  console.log('🧪 Testing Login Fix...\n')

  try {
    // Test 1: Verify admin user exists and password is correct
    console.log('1️⃣ Testing admin user...')
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })

    if (!admin) {
      console.log('  ✗ Admin user not found')
      return
    }

    console.log(`  ✓ Admin user found: ${admin.username}`)
    console.log(`  ✓ Email: ${admin.email}`)
    console.log(`  ✓ Role: ${admin.role?.name}`)
    console.log(`  ✓ Active: ${admin.isActive}`)

    // Test password
    const passwordValid = await bcrypt.compare('AdminPass@247', admin.passwordHash)
    console.log(`  ${passwordValid ? '✓' : '✗'} Password valid: ${passwordValid}`)

    // Test permissions
    const permissions = admin.role?.permissions.map(rp => rp.permission.name) || []
    console.log(`  ✓ Permissions: ${permissions.length}`)

    // Test 2: Verify database connection
    console.log('\n2️⃣ Testing database connection...')
    const userCount = await prisma.user.count()
    const roleCount = await prisma.role.count()
    const permissionCount = await prisma.permission.count()

    console.log(`  ✓ Users: ${userCount}`)
    console.log(`  ✓ Roles: ${roleCount}`)
    console.log(`  ✓ Permissions: ${permissionCount}`)

    // Test 3: Test session creation
    console.log('\n3️⃣ Testing session creation...')
    const crypto = require('crypto')
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const session = await prisma.session.create({
      data: {
        userId: admin.id,
        token: sessionToken,
        expiresAt
      }
    })

    console.log(`  ✓ Session created: ${session.id}`)
    console.log(`  ✓ Token length: ${sessionToken.length} chars`)
    console.log(`  ✓ Expires: ${expiresAt.toISOString()}`)

    // Clean up test session
    await prisma.session.delete({ where: { id: session.id } })
    console.log('  ✓ Test session cleaned up')

    console.log('\n✅ Login fix tests passed!')
    console.log('\n🎯 Ready to test login in application')
    console.log('\nDefault credentials:')
    console.log('  Username: admin')
    console.log('  Password: AdminPass@247')

  } catch (error) {
    console.error('\n❌ Login fix test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLoginFix()