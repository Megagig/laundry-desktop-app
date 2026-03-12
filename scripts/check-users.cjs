#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany()
    console.log('Users in database:', users.length)
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Name: ${user.fullName}`)
    })
    
    if (users.length === 0) {
      console.log('\n❌ No users found in database!')
      console.log('This explains the foreign key constraint violations.')
      console.log('The audit service is trying to reference user ID 1 which doesn\'t exist.')
    }
  } catch (error) {
    console.error('Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()