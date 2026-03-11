const { PrismaClient } = require('@prisma/client')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'prisma', 'laundry.db')
process.env.DATABASE_URL = `file:${dbPath}`

const prisma = new PrismaClient()

async function verify() {
  console.log('🔍 Verifying Security Database Setup...\n')

  try {
    // Check tables exist
    const users = await prisma.user.count()
    const roles = await prisma.role.count()
    const permissions = await prisma.permission.count()
    const rolePermissions = await prisma.rolePermission.count()

    console.log('📊 Database Counts:')
    console.log(`  ✓ Users: ${users}`)
    console.log(`  ✓ Roles: ${roles}`)
    console.log(`  ✓ Permissions: ${permissions}`)
    console.log(`  ✓ Role-Permission Mappings: ${rolePermissions}`)

    // Check admin user
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' },
      include: { role: true }
    })

    if (admin) {
      console.log('\n👤 Default Admin User:')
      console.log(`  ✓ Username: ${admin.username}`)
      console.log(`  ✓ Email: ${admin.email}`)
      console.log(`  ✓ Full Name: ${admin.fullName}`)
      console.log(`  ✓ Role: ${admin.role.name}`)
      console.log(`  ✓ Active: ${admin.isActive}`)
      console.log(`  ⚠️  Default Password: admin123`)
    }

    // Check role permissions
    console.log('\n🔐 Role Permissions:')
    const rolesWithPerms = await prisma.role.findMany({
      include: {
        _count: {
          select: { permissions: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    for (const role of rolesWithPerms) {
      console.log(`  ✓ ${role.name}: ${role._count.permissions} permissions`)
    }

    // Check permission modules
    console.log('\n📦 Permissions by Module:')
    const modules = await prisma.$queryRaw`
      SELECT module, COUNT(*) as count 
      FROM permissions 
      GROUP BY module 
      ORDER BY module
    `
    
    for (const mod of modules) {
      console.log(`  ✓ ${mod.module}: ${mod.count} permissions`)
    }

    console.log('\n✅ Security database verification complete!')
    console.log('\n🎯 Phase 1: Database Security Architecture - COMPLETE')

  } catch (error) {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verify()
