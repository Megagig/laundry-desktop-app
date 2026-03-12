const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'prisma', 'laundry.db')
process.env.DATABASE_URL = `file:${dbPath}`

const prisma = new PrismaClient()

async function verify() {
  const admin = await prisma.user.findUnique({
    where: { username: 'admin' }
  })

  if (!admin) {
    console.log('Admin user not found')
    return
  }

  console.log('Testing passwords...')
  
  const passwords = ['admin123', 'Admin123', 'AdminPass@247']
  
  for (const pwd of passwords) {
    const isValid = await bcrypt.compare(pwd, admin.passwordHash)
    console.log(`  ${pwd}: ${isValid ? '✓ VALID' : '✗ Invalid'}`)
  }

  await prisma.$disconnect()
}

verify()
