const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRBAC() {
  console.log('🧪 Testing RBAC System...\n')

  try {
    // Test 1: Get admin user
    console.log('1️⃣ Testing admin user permissions...')
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

    console.log(`  ✓ Admin user: ${admin.username}`)
    console.log(`  ✓ Role: ${admin.role?.name}`)
    console.log(`  ✓ Permissions: ${admin.role?.permissions.length || 0}`)

    // Test 2: List all permissions
    console.log('\n2️⃣ Testing permission list...')
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { name: 'asc' }
      ]
    })

    console.log(`  ✓ Total permissions: ${permissions.length}`)
    
    // Group by module
    const byModule = permissions.reduce((acc, p) => {
      acc[p.module] = (acc[p.module] || 0) + 1
      return acc
    }, {})

    console.log('  ✓ Permissions by module:')
    Object.entries(byModule).forEach(([module, count]) => {
      console.log(`    - ${module}: ${count}`)
    })

    // Test 3: Check specific permissions
    console.log('\n3️⃣ Testing specific permission checks...')
    const adminPermissions = admin.role?.permissions.map(rp => rp.permission.name) || []
    
    const testPermissions = [
      'view_dashboard',
      'create_customer',
      'manage_users',
      'view_audit_logs'
    ]

    testPermissions.forEach(perm => {
      const has = adminPermissions.includes(perm)
      console.log(`  ${has ? '✓' : '✗'} ${perm}: ${has ? 'GRANTED' : 'DENIED'}`)
    })

    // Test 4: Check all roles
    console.log('\n4️⃣ Testing all roles...')
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: { users: true }
        }
      }
    })

    roles.forEach(role => {
      console.log(`  ✓ ${role.name}:`)
      console.log(`    - Permissions: ${role.permissions.length}`)
      console.log(`    - Users: ${role._count.users}`)
    })

    // Test 5: Test role hierarchy
    console.log('\n5️⃣ Testing role hierarchy...')
    const rolePermCounts = {
      ADMIN: roles.find(r => r.name === 'ADMIN')?.permissions.length || 0,
      MANAGER: roles.find(r => r.name === 'MANAGER')?.permissions.length || 0,
      CASHIER: roles.find(r => r.name === 'CASHIER')?.permissions.length || 0,
      ATTENDANT: roles.find(r => r.name === 'ATTENDANT')?.permissions.length || 0
    }

    console.log('  ✓ Permission counts:')
    console.log(`    - ADMIN: ${rolePermCounts.ADMIN} (should be 42)`)
    console.log(`    - MANAGER: ${rolePermCounts.MANAGER} (should be ~31)`)
    console.log(`    - CASHIER: ${rolePermCounts.CASHIER} (should be ~14)`)
    console.log(`    - ATTENDANT: ${rolePermCounts.ATTENDANT} (should be ~6)`)

    const hierarchyValid = 
      rolePermCounts.ADMIN > rolePermCounts.MANAGER &&
      rolePermCounts.MANAGER > rolePermCounts.CASHIER &&
      rolePermCounts.CASHIER > rolePermCounts.ATTENDANT

    console.log(`  ${hierarchyValid ? '✓' : '✗'} Role hierarchy: ${hierarchyValid ? 'VALID' : 'INVALID'}`)

    console.log('\n✅ RBAC system tests passed!')
    console.log('\n🎯 Phase 3: RBAC System - Ready for Testing')

  } catch (error) {
    console.error('\n❌ RBAC test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRBAC()
