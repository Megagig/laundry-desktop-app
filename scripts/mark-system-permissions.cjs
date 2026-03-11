const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function markSystemPermissions() {
  try {
    console.log('Marking existing permissions as system permissions...')
    
    // Mark all existing permissions as system permissions
    const result = await prisma.permission.updateMany({
      data: {
        isSystem: true
      }
    })
    
    console.log(`✓ Marked ${result.count} permissions as system permissions`)
    
    // Also mark existing roles as system roles (if not already done)
    const roleResult = await prisma.role.updateMany({
      data: {
        isSystem: true
      }
    })
    
    console.log(`✓ Marked ${roleResult.count} roles as system roles`)
    
  } catch (error) {
    console.error('Error marking system permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

markSystemPermissions()