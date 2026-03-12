#!/usr/bin/env node

/**
 * Test Admin Permissions
 * Verifies that admin users have access to all permissions
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAdminPermissions() {
  console.log('🧪 Testing Admin Permissions...\n')
  
  try {
    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        role: {
          name: 'ADMIN'
        }
      },
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

    if (!adminUser) {
      console.log('❌ No admin user found')
      return false
    }

    console.log(`✅ Found admin user: ${adminUser.fullName}`)
    console.log(`   Role: ${adminUser.role?.name}`)
    console.log(`   Direct permissions: ${adminUser.role?.permissions.length || 0}`)

    // Get all permissions in the system
    const allPermissions = await prisma.permission.findMany()
    console.log(`   Total system permissions: ${allPermissions.length}`)

    // Test the RBAC service logic
    const { rbacService } = await import('../dist/electron/services/rbac.service.js')
    
    // Test getUserPermissions
    const userPermissions = await rbacService.getUserPermissions(adminUser.id)
    console.log(`   Permissions via getUserPermissions: ${userPermissions.length}`)

    // Test hasPermission for a few key permissions
    const testPermissions = ['manage_users', 'view_users', 'manage_roles', 'view_audit_logs']
    
    console.log('\n🔍 Testing specific permissions:')
    for (const permission of testPermissions) {
      const hasPermission = await rbacService.hasPermission(adminUser.id, permission)
      console.log(`   ${permission}: ${hasPermission ? '✅ GRANTED' : '❌ DENIED'}`)
    }

    // Check if admin gets all permissions
    const hasAllPermissions = userPermissions.length === allPermissions.length
    console.log(`\n📊 Admin has all permissions: ${hasAllPermissions ? '✅ YES' : '❌ NO'}`)

    if (!hasAllPermissions) {
      console.log('   Missing permissions:')
      const missingPermissions = allPermissions
        .map(p => p.name)
        .filter(p => !userPermissions.includes(p))
      missingPermissions.forEach(p => console.log(`     - ${p}`))
    }

    return hasAllPermissions
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

testAdminPermissions().then(success => {
  console.log('\n' + '='.repeat(50))
  console.log(`📊 Test Result: ${success ? '✅ PASS' : '❌ FAIL'}`)
  
  if (success) {
    console.log('\n🎉 Admin permissions are working correctly!')
    console.log('Admin users should now have access to all pages.')
  } else {
    console.log('\n⚠️  Admin permissions test failed.')
    console.log('There may be an issue with the RBAC service.')
  }
}).catch(console.error)