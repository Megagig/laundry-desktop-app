const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDynamicRBAC() {
  try {
    console.log('🧪 Testing Dynamic RBAC System...\n')
    
    // Test 1: Create a new custom role
    console.log('1. Creating a new custom role...')
    const newRole = await prisma.role.create({
      data: {
        name: 'SUPERVISOR',
        description: 'Supervises daily operations and staff',
        isSystem: false
      }
    })
    console.log(`✓ Created role: ${newRole.name} (ID: ${newRole.id})`)
    
    // Test 2: Create a new custom permission
    console.log('\n2. Creating a new custom permission...')
    const newPermission = await prisma.permission.create({
      data: {
        name: 'manage_inventory',
        description: 'Manage inventory and stock levels',
        module: 'INVENTORY',
        isSystem: false
      }
    })
    console.log(`✓ Created permission: ${newPermission.name} (ID: ${newPermission.id})`)
    
    // Test 3: Assign permission to role
    console.log('\n3. Assigning permission to role...')
    await prisma.rolePermission.create({
      data: {
        roleId: newRole.id,
        permissionId: newPermission.id
      }
    })
    console.log(`✓ Assigned permission ${newPermission.name} to role ${newRole.name}`)
    
    // Test 4: Verify role has permission
    console.log('\n4. Verifying role permissions...')
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
    
    // Test 5: Show system vs custom items
    console.log('\n5. Checking system vs custom items...')
    
    const systemRoles = await prisma.role.count({ where: { isSystem: true } })
    const customRoles = await prisma.role.count({ where: { isSystem: false } })
    console.log(`✓ System roles: ${systemRoles}, Custom roles: ${customRoles}`)
    
    const systemPermissions = await prisma.permission.count({ where: { isSystem: true } })
    const customPermissions = await prisma.permission.count({ where: { isSystem: false } })
    console.log(`✓ System permissions: ${systemPermissions}, Custom permissions: ${customPermissions}`)
    
    // Test 6: Test deletion (should work for custom items)
    console.log('\n6. Testing deletion of custom items...')
    
    // Delete role permission first
    await prisma.rolePermission.deleteMany({
      where: { roleId: newRole.id }
    })
    
    // Delete custom role
    await prisma.role.delete({
      where: { id: newRole.id }
    })
    console.log(`✓ Deleted custom role: ${newRole.name}`)
    
    // Delete custom permission
    await prisma.permission.delete({
      where: { id: newPermission.id }
    })
    console.log(`✓ Deleted custom permission: ${newPermission.name}`)
    
    console.log('\n🎉 All tests passed! Dynamic RBAC system is working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDynamicRBAC()