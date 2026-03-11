const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function testRBACIntegration() {
  console.log('🧪 Testing RBAC Integration...\n')

  try {
    // Test 1: Create test users for each role
    console.log('1️⃣ Creating test users for each role...')
    
    const roles = await prisma.role.findMany()
    const testUsers = []

    for (const role of roles) {
      if (role.name === 'ADMIN') continue // Skip admin, already exists
      
      const username = `test_${role.name.toLowerCase()}`
      const password = 'TestPass@123'
      const passwordHash = await bcrypt.hash(password, 12)
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { username }
      })
      
      if (!existingUser) {
        const user = await prisma.user.create({
          data: {
            username,
            fullName: `Test ${role.name}`,
            email: `${username}@test.com`,
            passwordHash,
            roleId: role.id,
            isActive: true
          }
        })
        testUsers.push({ user, role, password })
        console.log(`  ✓ Created ${role.name} user: ${username}`)
      } else {
        testUsers.push({ user: existingUser, role, password })
        console.log(`  ✓ Using existing ${role.name} user: ${username}`)
      }
    }

    // Test 2: Verify permission inheritance
    console.log('\n2️⃣ Testing permission inheritance...')
    
    for (const { user, role } of testUsers) {
      const userWithPermissions = await prisma.user.findUnique({
        where: { id: user.id },
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
      
      const permissions = userWithPermissions.role.permissions.map(rp => rp.permission.name)
      console.log(`  ✓ ${role.name}: ${permissions.length} permissions`)
      
      // Test specific permissions
      const hasViewDashboard = permissions.includes('view_dashboard')
      const hasManageUsers = permissions.includes('manage_users')
      const hasCreateCustomer = permissions.includes('create_customer')
      
      console.log(`    - view_dashboard: ${hasViewDashboard ? '✓' : '✗'}`)
      console.log(`    - manage_users: ${hasManageUsers ? '✓' : '✗'}`)
      console.log(`    - create_customer: ${hasCreateCustomer ? '✓' : '✗'}`)
    }

    // Test 3: Test role hierarchy
    console.log('\n3️⃣ Testing role hierarchy...')
    
    const roleHierarchy = {
      ADMIN: await getRolePermissions('ADMIN'),
      MANAGER: await getRolePermissions('MANAGER'),
      CASHIER: await getRolePermissions('CASHIER'),
      ATTENDANT: await getRolePermissions('ATTENDANT')
    }
    
    console.log('  ✓ Permission counts:')
    Object.entries(roleHierarchy).forEach(([role, perms]) => {
      console.log(`    - ${role}: ${perms.length} permissions`)
    })
    
    // Verify hierarchy
    const hierarchyTests = [
      { higher: 'ADMIN', lower: 'MANAGER' },
      { higher: 'MANAGER', lower: 'CASHIER' },
      { higher: 'CASHIER', lower: 'ATTENDANT' }
    ]
    
    hierarchyTests.forEach(({ higher, lower }) => {
      const higherCount = roleHierarchy[higher].length
      const lowerCount = roleHierarchy[lower].length
      const valid = higherCount > lowerCount
      console.log(`  ${valid ? '✓' : '✗'} ${higher} (${higherCount}) > ${lower} (${lowerCount}): ${valid ? 'VALID' : 'INVALID'}`)
    })

    // Test 4: Test specific permission scenarios
    console.log('\n4️⃣ Testing permission scenarios...')
    
    const scenarios = [
      {
        role: 'ADMIN',
        should_have: ['view_dashboard', 'create_customer', 'manage_users', 'view_audit_logs'],
        should_not_have: [] // Admin has all permissions
      },
      {
        role: 'MANAGER',
        should_have: ['view_dashboard', 'create_customer', 'view_reports'],
        should_not_have: ['manage_users', 'manage_roles']
      },
      {
        role: 'CASHIER',
        should_have: ['view_dashboard', 'create_customer', 'process_payment'],
        should_not_have: ['manage_users', 'view_audit_logs', 'delete_customer']
      },
      {
        role: 'ATTENDANT',
        should_have: ['view_dashboard', 'view_customer'],
        should_not_have: ['create_customer', 'delete_customer', 'manage_users']
      }
    ]
    
    for (const scenario of scenarios) {
      const permissions = roleHierarchy[scenario.role]
      console.log(`  Testing ${scenario.role}:`)
      
      scenario.should_have.forEach(perm => {
        const has = permissions.includes(perm)
        console.log(`    ${has ? '✓' : '✗'} Should have ${perm}: ${has ? 'PASS' : 'FAIL'}`)
      })
      
      scenario.should_not_have.forEach(perm => {
        const has = permissions.includes(perm)
        console.log(`    ${!has ? '✓' : '✗'} Should NOT have ${perm}: ${!has ? 'PASS' : 'FAIL'}`)
      })
    }

    // Test 5: Test permission modules
    console.log('\n5️⃣ Testing permission modules...')
    
    const modules = await prisma.permission.groupBy({
      by: ['module'],
      _count: {
        id: true
      }
    })
    
    console.log('  ✓ Permission modules:')
    modules.forEach(module => {
      console.log(`    - ${module.module}: ${module._count.id} permissions`)
    })
    
    const expectedModules = [
      'DASHBOARD', 'CUSTOMER', 'ORDER', 'SERVICE', 'PAYMENT', 
      'EXPENSE', 'REPORT', 'PRINTER', 'SETTINGS', 'BACKUP', 
      'USER', 'AUDIT', 'LICENSE'
    ]
    
    const actualModules = modules.map(m => m.module).sort()
    const missingModules = expectedModules.filter(m => !actualModules.includes(m))
    const extraModules = actualModules.filter(m => !expectedModules.includes(m))
    
    if (missingModules.length === 0 && extraModules.length === 0) {
      console.log('  ✓ All expected modules present')
    } else {
      if (missingModules.length > 0) {
        console.log(`  ✗ Missing modules: ${missingModules.join(', ')}`)
      }
      if (extraModules.length > 0) {
        console.log(`  ✗ Extra modules: ${extraModules.join(', ')}`)
      }
    }

    console.log('\n✅ RBAC integration tests completed!')
    console.log('\n🎯 Test Users Created:')
    testUsers.forEach(({ user, role, password }) => {
      console.log(`  - ${role.name}: ${user.username} / ${password}`)
    })

  } catch (error) {
    console.error('\n❌ RBAC integration test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function getRolePermissions(roleName) {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    }
  })
  
  return role ? role.permissions.map(rp => rp.permission.name) : []
}

testRBACIntegration()