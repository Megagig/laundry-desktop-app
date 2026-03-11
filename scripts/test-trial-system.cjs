#!/usr/bin/env node

/**
 * Trial System Test Suite
 * 
 * Tests all trial mode functionality including:
 * - Trial start/status/expiry
 * - Machine ID binding
 * - Trial reset prevention
 * - Integration with license system
 * - Startup flow integration
 */

const { PrismaClient } = require('@prisma/client')
const path = require('path')

// Initialize Prisma
const prisma = new PrismaClient()

// Test results tracking
let totalTests = 0
let passedTests = 0
let failedTests = []

function logTest(testName, passed, error = null) {
  totalTests++
  if (passed) {
    passedTests++
    console.log(`✅ ${testName}`)
  } else {
    failedTests.push({ testName, error })
    console.log(`❌ ${testName}`)
    if (error) {
      console.log(`   Error: ${error.message}`)
    }
  }
}

async function testTrialService() {
  console.log('\n🧪 Testing Trial Service...\n')
  
  try {
    // Import the trial service
    const { trialService } = await import('../dist/electron/services/trial.service.js')
    
    // Test 1: Initial trial status (should be able to start)
    try {
      const initialStatus = await trialService.getTrialStatus()
      logTest('Get initial trial status', 
        !initialStatus.hasTrialStarted && 
        initialStatus.canStartTrial && 
        !initialStatus.isTrialActive &&
        !initialStatus.isTrialExpired
      )
    } catch (error) {
      logTest('Get initial trial status', false, error)
    }

    // Test 2: Start trial
    try {
      const trialInfo = await trialService.startTrial()
      logTest('Start trial', 
        trialInfo.isActive && 
        trialInfo.daysRemaining === 14 &&
        !trialInfo.isExpired &&
        trialInfo.machineId
      )
    } catch (error) {
      logTest('Start trial', false, error)
    }

    // Test 3: Get trial status after start
    try {
      const status = await trialService.getTrialStatus()
      logTest('Get trial status after start', 
        status.hasTrialStarted && 
        status.isTrialActive &&
        !status.isTrialExpired &&
        status.daysRemaining === 14
      )
    } catch (error) {
      logTest('Get trial status after start', false, error)
    }

    // Test 4: Check if trial is active
    try {
      const isActive = await trialService.isTrialActive()
      logTest('Check if trial is active', isActive === true)
    } catch (error) {
      logTest('Check if trial is active', false, error)
    }

    // Test 5: Check if trial is expired (should be false)
    try {
      const isExpired = await trialService.isTrialExpired()
      logTest('Check if trial is expired', isExpired === false)
    } catch (error) {
      logTest('Check if trial is expired', false, error)
    }

    // Test 6: Get days remaining
    try {
      const daysRemaining = await trialService.getDaysRemaining()
      logTest('Get days remaining', daysRemaining === 14)
    } catch (error) {
      logTest('Get days remaining', false, error)
    }

    // Test 7: Get trial warning (should be null for new trial)
    try {
      const warning = await trialService.getTrialWarning()
      logTest('Get trial warning (new trial)', warning === null)
    } catch (error) {
      logTest('Get trial warning (new trial)', false, error)
    }

    // Test 8: Can start trial (should be false after starting)
    try {
      const canStart = await trialService.canStartTrial()
      logTest('Can start trial (after starting)', canStart === false)
    } catch (error) {
      logTest('Can start trial (after starting)', false, error)
    }

    // Test 9: Get trial info
    try {
      const info = await trialService.getTrialInfo()
      logTest('Get trial info', 
        info !== null &&
        info.isActive &&
        !info.isExpired &&
        info.daysRemaining === 14
      )
    } catch (error) {
      logTest('Get trial info', false, error)
    }

    // Test 10: Should block application (should be false with active trial)
    try {
      const shouldBlock = await trialService.shouldBlockApplication()
      logTest('Should block application (active trial)', shouldBlock === false)
    } catch (error) {
      logTest('Should block application (active trial)', false, error)
    }

    // Test 11: Get trial statistics
    try {
      const stats = await trialService.getTrialStats()
      logTest('Get trial statistics', 
        stats.trialStarted &&
        stats.status === 'active' &&
        stats.daysUsed >= 0 &&
        stats.daysRemaining === 14
      )
    } catch (error) {
      logTest('Get trial statistics', false, error)
    }

    // Test 12: Try to start trial again (should fail)
    try {
      await trialService.startTrial()
      logTest('Try to start trial again', false, new Error('Should have thrown error'))
    } catch (error) {
      logTest('Try to start trial again (should fail)', 
        error.message.includes('already been started')
      )
    }

    // Test 13: Reset trial (admin function)
    try {
      await trialService.resetTrial()
      const statusAfterReset = await trialService.getTrialStatus()
      logTest('Reset trial', 
        !statusAfterReset.hasTrialStarted &&
        statusAfterReset.canStartTrial
      )
    } catch (error) {
      logTest('Reset trial', false, error)
    }

    // Test 14: Start trial again after reset
    try {
      const trialInfo = await trialService.startTrial()
      logTest('Start trial after reset', 
        trialInfo.isActive && 
        trialInfo.daysRemaining === 14
      )
    } catch (error) {
      logTest('Start trial after reset', false, error)
    }

  } catch (error) {
    console.error('Failed to import trial service:', error)
    logTest('Import trial service', false, error)
  }
}

async function testStartupIntegration() {
  console.log('\n🚀 Testing Startup Integration...\n')
  
  try {
    // Import the startup service
    const { startupService } = await import('../dist/electron/services/startup.service.js')
    
    // Test 1: Startup checks with active trial
    try {
      const startupResult = await startupService.performStartupChecks()
      logTest('Startup checks with active trial', 
        startupResult.canProceed === true || startupResult.requiresTrial === true
      )
    } catch (error) {
      logTest('Startup checks with active trial', false, error)
    }

    // Test 2: Get trial status from startup service
    try {
      const trialStatus = await startupService.getTrialStatus()
      logTest('Get trial status from startup service', 
        trialStatus.hasTrialStarted &&
        trialStatus.isTrialActive
      )
    } catch (error) {
      logTest('Get trial status from startup service', false, error)
    }

    // Test 3: Should block application
    try {
      const shouldBlock = await startupService.shouldBlockApplication()
      logTest('Should block application from startup service', shouldBlock === false)
    } catch (error) {
      logTest('Should block application from startup service', false, error)
    }

  } catch (error) {
    console.error('Failed to import startup service:', error)
    logTest('Import startup service', false, error)
  }
}

async function testDatabaseIntegration() {
  console.log('\n💾 Testing Database Integration...\n')
  
  try {
    // Test 1: Check trial settings in database
    const trialStartSetting = await prisma.setting.findUnique({
      where: { key: 'trial_start_date' }
    })
    
    const trialMachineSetting = await prisma.setting.findUnique({
      where: { key: 'trial_machine_id' }
    })
    
    logTest('Trial settings in database', 
      trialStartSetting !== null && 
      trialMachineSetting !== null
    )

    // Test 2: Validate trial start date format
    if (trialStartSetting) {
      const startDate = new Date(trialStartSetting.value)
      logTest('Trial start date format', !isNaN(startDate.getTime()))
    }

    // Test 3: Validate machine ID format
    if (trialMachineSetting) {
      logTest('Machine ID format', 
        trialMachineSetting.value.startsWith('LND-') &&
        trialMachineSetting.value.length > 10
      )
    }

  } catch (error) {
    logTest('Database integration test', false, error)
  }
}

async function testExpiredTrial() {
  console.log('\n⏰ Testing Expired Trial Scenario...\n')
  
  try {
    // Simulate expired trial by setting start date to 15 days ago
    const expiredStartDate = new Date()
    expiredStartDate.setDate(expiredStartDate.getDate() - 15)
    
    await prisma.setting.upsert({
      where: { key: 'trial_start_date' },
      update: { value: expiredStartDate.toISOString() },
      create: { key: 'trial_start_date', value: expiredStartDate.toISOString() }
    })

    const { trialService } = await import('../dist/electron/services/trial.service.js')
    
    // Test 1: Check if trial is expired
    try {
      const isExpired = await trialService.isTrialExpired()
      logTest('Check expired trial', isExpired === true)
    } catch (error) {
      logTest('Check expired trial', false, error)
    }

    // Test 2: Check if trial is active (should be false)
    try {
      const isActive = await trialService.isTrialActive()
      logTest('Check expired trial is not active', isActive === false)
    } catch (error) {
      logTest('Check expired trial is not active', false, error)
    }

    // Test 3: Get trial warning for expired trial
    try {
      const warning = await trialService.getTrialWarning()
      logTest('Get expired trial warning', 
        warning !== null && 
        warning.includes('expired')
      )
    } catch (error) {
      logTest('Get expired trial warning', false, error)
    }

    // Test 4: Should block application with expired trial
    try {
      const shouldBlock = await trialService.shouldBlockApplication()
      logTest('Should block with expired trial', shouldBlock === true)
    } catch (error) {
      logTest('Should block with expired trial', false, error)
    }

    // Test 5: Days remaining should be 0
    try {
      const daysRemaining = await trialService.getDaysRemaining()
      logTest('Days remaining for expired trial', daysRemaining === 0)
    } catch (error) {
      logTest('Days remaining for expired trial', false, error)
    }

  } catch (error) {
    logTest('Expired trial test setup', false, error)
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...\n')
  
  try {
    // Remove trial settings
    await prisma.setting.deleteMany({
      where: {
        key: {
          in: ['trial_start_date', 'trial_machine_id']
        }
      }
    })
    
    console.log('✅ Test data cleaned up')
  } catch (error) {
    console.log('❌ Failed to clean up test data:', error.message)
  }
}

async function runAllTests() {
  console.log('🎯 Trial System Test Suite')
  console.log('=' .repeat(50))
  
  try {
    // Clean up any existing trial data first
    await cleanup()
    
    // Run all test suites
    await testTrialService()
    await testStartupIntegration()
    await testDatabaseIntegration()
    await testExpiredTrial()
    
    // Final cleanup
    await cleanup()
    
  } catch (error) {
    console.error('Test suite failed:', error)
  } finally {
    await prisma.$disconnect()
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(50))
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${failedTests.length}`)
  console.log(`Success Rate: ${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%`)
  
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:')
    failedTests.forEach(({ testName, error }) => {
      console.log(`  - ${testName}`)
      if (error) {
        console.log(`    ${error.message}`)
      }
    })
  }
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Trial system is working correctly.')
  } else {
    console.log(`\n⚠️  ${failedTests.length} test(s) failed. Please review the errors above.`)
    process.exit(1)
  }
}

// Run the tests
runAllTests().catch(console.error)