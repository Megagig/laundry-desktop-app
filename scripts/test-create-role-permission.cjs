const { PrismaClient } = require('@prisma/client')
const path = require('path')

// Set correct database path
const dbPath = path.join(__dirname, '..', 'prisma', 'laundry.db')
process.env.DATABASE_URL = `file:${dbPath}`

const prisma = new PrismaClient()

async function testCreateRolePermission() {
  try {
    console.log('🧪 Testing Create Role/Permission API...\n')
    
    // First, let's verify we have the admin user
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' },
      include: { role: true }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Please run the seed script first.')
      return
    }
    
    console.log(`✓ Found admin user: ${adminUser.username} with role: ${adminUser.role?.name}`)
    
    // Test creating a new role directly in the database
    console.log('\n1. Testing role creation...')
    const newRole = await prisma.role.create({
      data: {
        name: 'TEST_ROLE',
        description: 'A test role for API testing',
        isSystem: false
      }
    })
    console.log(`✓ Created role: ${newRole.name} (ID: ${newRole.id}, isSystem: ${newRole.isSystem})`)
    
    // Test creating a new permission
    console.log('\n2. Testing permission creation...')
    const newPermission = await prisma.permission.create({
      data: {
        name: 'test_permission',
        description: 'A test permission for API testing',
        module: 'TEST',
        isSystem: false
      }
    })
    console.log(`✓ Created permission: ${newPermission.name} (ID: ${newPermission.id}, isSystem: ${newPermission.isSystem})`)
    
    // Test assigning permission to role
    console.log('\n3. Testing permission assignment...')
    await prisma.rolePermission.create({
      data: {
        roleId: newRole.id,
        permissionId: newPermission.id
      }
    })
    console.log(`✓ Assigned permission ${newPermission.name} to role ${newRole.name}`)
    
    // Verify the assignment
    const roleWithPermissions = await prisma.role.findUnique({
      where: { id: newRole.id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
    
    const permissionNames = roleWithPermissions.permissions.map(rp => rp.permission.name)
    console.log(`✓ Role ${newRole.name} has permissions: [${permissionNames.join(', ')}]`)
    
    // Clean up
    console.log('\n4. Cleaning up test data...')
    await prisma.rolePermission.deleteMany({
      where: { roleId: newRole.id }
    })
    await prisma.role.delete({
      where: { id: newRole.id }
    })
    await prisma.permission.delete({
      where: { id: newPermission.id }
    })
    console.log('✓ Test data cleaned up')
    
    // Show current system vs custom counts
    console.log('\n5. Current database state...')
    const systemRoles = await prisma.role.count({ where: { isSystem: true } })
    const customRoles = await prisma.role.count({ where: { isSystem: false } })
    const systemPermissions = await prisma.permission.count({ where: { isSystem: true } })
    const customPermissions = await prisma.permission.count({ where: { isSystem: false } })
    
    console.log(`✓ System roles: ${systemRoles}, Custom roles: ${customRoles}`)
    console.log(`✓ System permissions: ${systemPermissions}, Custom permissions: ${customPermissions}`)
    
    console.log('\n🎉 All database operations work correctly!')
    console.log('✅ The create role/permission functionality should work in the UI now.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCreateRolePermission()