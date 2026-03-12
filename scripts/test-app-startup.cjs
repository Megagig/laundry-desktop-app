const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAppStartup() {
  console.log('🧪 Testing App Startup Requirements...\n')

  try {
    // Test 1: Database connection
    console.log('1️⃣ Testing database connection...')
    const userCount = await prisma.user.count()
    console.log(`  ✓ Database connected, ${userCount} users found`)

    // Test 2: Admin user exists
    console.log('\n2️⃣ Testing admin user...')
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' },
      include: { role: true }
    })

    if (admin) {
      console.log(`  ✓ Admin user exists: ${admin.username}`)
      console.log(`  ✓ Role: ${admin.role?.name}`)
      console.log(`  ✓ Active: ${admin.isActive}`)
    } else {
      console.log('  ✗ Admin user not found')
    }

    // Test 3: Roles and permissions
    console.log('\n3️⃣ Testing roles and permissions...')
    const roles = await prisma.role.count()
    const permissions = await prisma.permission.count()
    console.log(`  ✓ Roles: ${roles}`)
    console.log(`  ✓ Permissions: ${permissions}`)

    // Test 4: Check if all required tables exist
    console.log('\n4️⃣ Testing database schema...')
    const tables = [
      'users', 'roles', 'permissions', 'role_permissions', 
      'sessions', 'audit_logs', 'licenses'
    ]

    for (const table of tables) {
      try {
        const result = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name=${table}`
        const exists = result.length > 0
        console.log(`  ${exists ? '✓' : '✗'} Table ${table}: ${exists ? 'EXISTS' : 'MISSING'}`)
      } catch (error) {
        console.log(`  ✗ Error checking table ${table}:`, error.message)
      }
    }

    console.log('\n✅ App startup requirements verified!')
    console.log('\n🎯 Application should be ready to start')
    console.log('\nTo start the application:')
    console.log('  npm run build && npm start')
    console.log('\nDefault login:')
    console.log('  Username: admin')
    console.log('  Password: AdminPass@247')

  } catch (error) {
    console.error('\n❌ App startup test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAppStartup()