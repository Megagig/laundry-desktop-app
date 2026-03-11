#!/usr/bin/env node

/**
 * Trial Integration Verification
 * 
 * Quick verification that trial system is properly integrated
 * and all components are working together.
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyIntegration() {
  console.log('🔍 Verifying Trial System Integration...\n')
  
  let allGood = true
  
  try {
    // 1. Check if trial service can be imported
    console.log('1. Checking trial service import...')
    try {
      const { trialService } = await import('../dist/electron/services/trial.service.js')
      console.log('   ✅ Trial service imported successfully')
      
      // Quick status check
      const status = await trialService.getTrialStatus()
      console.log(`   ✅ Trial status check: ${status.hasTrialStarted ? 'Started' : 'Not started'}`)
    } catch (error) {
      console.log('   ❌ Failed to import trial service:', error.message)
      allGood = false
    }
    
    // 2. Check if IPC handlers are registered
    console.log('\n2. Checking IPC handler files...')
    try {
      const fs = require('fs')
      const trialIpcExists = fs.existsSync('./dist/electron/ipc/trial.ipc.js')
      console.log(`   ${trialIpcExists ? '✅' : '❌'} Trial IPC handlers: ${trialIpcExists ? 'Found' : 'Missing'}`)
      
      if (!trialIpcExists) allGood = false
    } catch (error) {
      console.log('   ❌ Error checking IPC files:', error.message)
      allGood = false
    }
    
    // 3. Check database schema
    console.log('\n3. Checking database schema...')
    try {
      // Check if settings table exists and can store trial data
      const testSetting = await prisma.setting.findFirst({
        where: { key: 'test_trial_integration' }
      })
      
      // Create a test setting
      await prisma.setting.upsert({
        where: { key: 'test_trial_integration' },
        update: { value: new Date().toISOString() },
        create: { key: 'test_trial_integration', value: new Date().toISOString() }
      })
      
      // Clean up test setting
      await prisma.setting.delete({
        where: { key: 'test_trial_integration' }
      })
      
      console.log('   ✅ Database schema supports trial data')
    } catch (error) {
      console.log('   ❌ Database schema issue:', error.message)
      allGood = false
    }
    
    // 4. Check startup service integration
    console.log('\n4. Checking startup service integration...')
    try {
      const fs = require('fs')
      const startupServicePath = './dist/electron/services/startup.service.js'
      
      if (fs.existsSync(startupServicePath)) {
        const startupContent = fs.readFileSync(startupServicePath, 'utf8')
        const hasTrialImport = startupContent.includes('trial.service')
        console.log(`   ${hasTrialImport ? '✅' : '❌'} Startup service trial integration: ${hasTrialImport ? 'Found' : 'Missing'}`)
        
        if (!hasTrialImport) allGood = false
      } else {
        console.log('   ❌ Startup service file not found')
        allGood = false
      }
    } catch (error) {
      console.log('   ❌ Error checking startup service:', error.message)
      allGood = false
    }
    
    // 5. Check preload API exposure
    console.log('\n5. Checking preload API exposure...')
    try {
      const fs = require('fs')
      const preloadPath = './dist/electron/preload.cjs'
      
      if (fs.existsSync(preloadPath)) {
        const preloadContent = fs.readFileSync(preloadPath, 'utf8')
        const hasTrialAPI = preloadContent.includes('trial:')
        console.log(`   ${hasTrialAPI ? '✅' : '❌'} Preload trial API: ${hasTrialAPI ? 'Exposed' : 'Missing'}`)
        
        if (!hasTrialAPI) allGood = false
      } else {
        console.log('   ❌ Preload file not found')
        allGood = false
      }
    } catch (error) {
      console.log('   ❌ Error checking preload file:', error.message)
      allGood = false
    }
    
    // 6. Check main process integration
    console.log('\n6. Checking main process integration...')
    try {
      const fs = require('fs')
      const mainPath = './dist/electron/main.js'
      
      if (fs.existsSync(mainPath)) {
        const mainContent = fs.readFileSync(mainPath, 'utf8')
        const hasTrialImport = mainContent.includes('trial.ipc')
        console.log(`   ${hasTrialImport ? '✅' : '❌'} Main process trial import: ${hasTrialImport ? 'Found' : 'Missing'}`)
        
        if (!hasTrialImport) allGood = false
      } else {
        console.log('   ❌ Main process file not found')
        allGood = false
      }
    } catch (error) {
      console.log('   ❌ Error checking main process:', error.message)
      allGood = false
    }
    
  } catch (error) {
    console.error('Verification failed:', error)
    allGood = false
  } finally {
    await prisma.$disconnect()
  }
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 INTEGRATION VERIFICATION SUMMARY')
  console.log('='.repeat(50))
  
  if (allGood) {
    console.log('🎉 All integration checks passed!')
    console.log('✅ Trial system is properly integrated and ready to use.')
    console.log('\n📋 Integration Status:')
    console.log('   ✅ Trial service implemented')
    console.log('   ✅ IPC handlers registered')
    console.log('   ✅ Database schema compatible')
    console.log('   ✅ Startup service integrated')
    console.log('   ✅ Preload API exposed')
    console.log('   ✅ Main process configured')
    console.log('\n🚀 Ready for Phase 10: Audit Logging')
  } else {
    console.log('⚠️  Some integration issues found.')
    console.log('❌ Please review the errors above and rebuild if necessary.')
    console.log('\n💡 Try running: npm run build')
    process.exit(1)
  }
}

verifyIntegration().catch(console.error)