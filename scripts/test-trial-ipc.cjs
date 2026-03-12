#!/usr/bin/env node

/**
 * Trial IPC Handlers Test Suite
 * 
 * Tests all trial IPC handlers including:
 * - Public trial APIs
 * - Admin-only trial APIs
 * - Permission checks
 * - Error handling
 */

const { spawn } = require('child_process')
const path = require('path')

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
      console.log(`   Error: ${error}`)
    }
  }
}

async function testTrialIPC() {
  console.log('\n🔌 Testing Trial IPC Handlers...\n')
  
  return new Promise((resolve) => {
    // Create a test script that will run in the Electron context
    const testScript = `
      const { app } = require('electron')
      const { PrismaClient } = require('@prisma/client')
      
      const prisma = new PrismaClient()
      
      async function runTests() {
        let testResults = []
        
        try {
          // Import IPC handlers (this registers them)
          await import('../electron/ipc/trial.ipc.js')
          await import('../electron/services/trial.service.js')
          
          // Clean up any existing trial data
          await prisma.setting.deleteMany({
            where: {
              key: { in: ['trial_start_date', 'trial_machine_id'] }
            }
          })
          
          // Test 1: Start trial (public access)
          try {
            const { ipcMain } = require('electron')
            
            // Simulate IPC call
            const result = await new Promise((resolve) => {
              const handler = ipcMain.listeners('trial:start')[0]
              if (handler) {
                handler({}, {}).then(resolve).catch(resolve)
              } else {
                resolve({ success: false, error: 'Handler not found' })
              }
            })
            
            testResults.push({
              name: 'Start trial IPC',
              passed: result.success === true && result.data && result.data.isActive
            })
          } catch (error) {
            testResults.push({
              name: 'Start trial IPC',
              passed: false,
              error: error.message
            })
          }
          
          // Test 2: Get trial status (public access)
          try {
            const { ipcMain } = require('electron')
            
            const result = await new Promise((resolve) => {
              const handler = ipcMain.listeners('trial:getStatus')[0]
              if (handler) {
                handler({}, {}).then(resolve).catch(resolve)
              } else {
                resolve({ success: false, error: 'Handler not found' })
              }
            })
            
            testResults.push({
              name: 'Get trial status IPC',
              passed: result.success === true && result.data && result.data.hasTrialStarted
            })
          } catch (error) {
            testResults.push({
              name: 'Get trial status IPC',
              passed: false,
              error: error.message
            })
          }
          
          // Test 3: Check if trial is active (public access)
          try {
            const { ipcMain } = require('electron')
            
            const result = await new Promise((resolve) => {
              const handler = ipcMain.listeners('trial:isActive')[0]
              if (handler) {
                handler({}, {}).then(resolve).catch(resolve)
              } else {
                resolve({ success: false, error: 'Handler not found' })
              }
            })
            
            testResults.push({
              name: 'Check trial active IPC',
              passed: result.success === true && result.data === true
            })
          } catch (error) {
            testResults.push({
              name: 'Check trial active IPC',
              passed: false,
              error: error.message
            })
          }
          
          // Test 4: Get days remaining (public access)
          try {
            const { ipcMain } = require('electron')
            
            const result = await new Promise((resolve) => {
              const handler = ipcMain.listeners('trial:getDaysRemaining')[0]
              if (handler) {
                handler({}, {}).then(resolve).catch(resolve)
              } else {
                resolve({ success: false, error: 'Handler not found' })
              }
            })
            
            testResults.push({
              name: 'Get days remaining IPC',
              passed: result.success === true && result.data === 14
            })
          } catch (error) {
            testResults.push({
              name: 'Get days remaining IPC',
              passed: false,
              error: error.message
            })
          }
          
          // Test 5: Get trial warning (public access)
          try {
            const { ipcMain } = require('electron')
            
            const result = await new Promise((resolve) => {
              const handler = ipcMain.listeners('trial:getWarning')[0]
              if (handler) {
                handler({}, {}).then(resolve).catch(resolve)
              } else {
                resolve({ success: false, error: 'Handler not found' })
              }
            })
            
            testResults.push({
              name: 'Get trial warning IPC',
              passed: result.success === true
            })
          } catch (error) {
            testResults.push({
              name: 'Get trial warning IPC',
              passed: false,
              error: error.message
            })
          }
          
          // Test 6: Should block application (public access)
          try {
            const { ipcMain } = require('electron')
            
            const result = await new Promise((resolve) => {
              const handler = ipcMain.listeners('trial:shouldBlock')[0]
              if (handler) {
                handler({}, {}).then(resolve).catch(resolve)
              } else {
                resolve({ success: false, error: 'Handler not found' })
              }
            })
            
            testResults.push({
              name: 'Should block application IPC',
              passed: result.success === true && result.data === false
            })
          } catch (error) {
            testResults.push({
              name: 'Should block application IPC',
              passed: false,
              error: error.message
            })
          }
          
          // Test 7: Reset trial without permission (should fail)
          try {
            const { ipcMain } = require('electron')
            
            const result = await new Promise((resolve) => {
              const handler = ipcMain.listeners('trial:reset')[0]
              if (handler) {
                handler({}, 'invalid-token').then(resolve).catch(resolve)
              } else {
                resolve({ success: false, error: 'Handler not found' })
              }
            })
            
            testResults.push({
              name: 'Reset trial without permission (should fail)',
              passed: result.success === false
            })
          } catch (error) {
            testResults.push({
              name: 'Reset trial without permission (should fail)',
              passed: true // Error is expected
            })
          }
          
          // Test 8: Get trial stats without permission (should fail)
          try {
            const { ipcMain } = require('electron')
            
            const result = await new Promise((resolve) => {
              const handler = ipcMain.listeners('trial:getStats')[0]
              if (handler) {
                handler({}, 'invalid-token').then(resolve).catch(resolve)
              } else {
                resolve({ success: false, error: 'Handler not found' })
              }
            })
            
            testResults.push({
              name: 'Get trial stats without permission (should fail)',
              passed: result.success === false
            })
          } catch (error) {
            testResults.push({
              name: 'Get trial stats without permission (should fail)',
              passed: true // Error is expected
            })
          }
          
        } catch (error) {
          console.error('Test setup failed:', error)
        } finally {
          // Clean up
          await prisma.setting.deleteMany({
            where: {
              key: { in: ['trial_start_date', 'trial_machine_id'] }
            }
          })
          await prisma.$disconnect()
        }
        
        // Output results
        console.log(JSON.stringify(testResults))
        app.quit()
      }
      
      app.whenReady().then(runTests)
    `
    
    // Write the test script to a temporary file
    const fs = require('fs')
    const testFilePath = path.join(__dirname, 'temp-trial-ipc-test.js')
    fs.writeFileSync(testFilePath, testScript)
    
    // Run the test in Electron
    const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
    const child = spawn(electronPath, [testFilePath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.join(__dirname, '..')
    })
    
    let output = ''
    let errorOutput = ''
    
    child.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })
    
    child.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(testFilePath)
      } catch (e) {
        // Ignore cleanup errors
      }
      
      if (code === 0) {
        try {
          // Parse the JSON output
          const lines = output.split('\\n')
          const jsonLine = lines.find(line => line.startsWith('[') || line.startsWith('{'))
          
          if (jsonLine) {
            const testResults = JSON.parse(jsonLine)
            
            testResults.forEach(result => {
              logTest(result.name, result.passed, result.error)
            })
          } else {
            logTest('Parse IPC test results', false, 'No JSON output found')
          }
        } catch (error) {
          logTest('Parse IPC test results', false, error.message)
        }
      } else {
        logTest('Run IPC tests in Electron', false, \`Process exited with code \${code}\`)
        if (errorOutput) {
          console.log('Error output:', errorOutput)
        }
      }
      
      resolve()
    })
    
    child.on('error', (error) => {
      logTest('Start Electron for IPC tests', false, error.message)
      resolve()
    })
  })
}

async function testStartupIPC() {
  console.log('\n🚀 Testing Startup IPC Integration...\n')
  
  return new Promise((resolve) => {
    const testScript = `
      const { app } = require('electron')
      
      async function runTests() {
        let testResults = []
        
        try {
          // Import startup IPC handlers
          await import('../electron/ipc/startup.ipc.js')
          
          // Test 1: Startup check
          try {
            const { ipcMain } = require('electron')
            
            const result = await new Promise((resolve) => {
              const handler = ipcMain.listeners('startup:check')[0]
              if (handler) {
                handler({}, {}).then(resolve).catch(resolve)
              } else {
                resolve({ error: 'Handler not found' })
              }
            })
            
            testResults.push({
              name: 'Startup check IPC',
              passed: result && (result.canProceed !== undefined)
            })
          } catch (error) {
            testResults.push({
              name: 'Startup check IPC',
              passed: false,
              error: error.message
            })
          }
          
          // Test 2: Should block check
          try {
            const { ipcMain } = require('electron')
            
            const result = await new Promise((resolve) => {
              const handler = ipcMain.listeners('startup:should-block')[0]
              if (handler) {
                handler({}, {}).then(resolve).catch(resolve)
              } else {
                resolve(false)
              }
            })
            
            testResults.push({
              name: 'Should block IPC',
              passed: typeof result === 'boolean'
            })
          } catch (error) {
            testResults.push({
              name: 'Should block IPC',
              passed: false,
              error: error.message
            })
          }
          
        } catch (error) {
          console.error('Startup IPC test setup failed:', error)
        }
        
        console.log(JSON.stringify(testResults))
        app.quit()
      }
      
      app.whenReady().then(runTests)
    `
    
    const fs = require('fs')
    const testFilePath = path.join(__dirname, 'temp-startup-ipc-test.js')
    fs.writeFileSync(testFilePath, testScript)
    
    const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
    const child = spawn(electronPath, [testFilePath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.join(__dirname, '..')
    })
    
    let output = ''
    
    child.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    child.on('close', (code) => {
      try {
        fs.unlinkSync(testFilePath)
      } catch (e) {
        // Ignore cleanup errors
      }
      
      if (code === 0) {
        try {
          const lines = output.split('\\n')
          const jsonLine = lines.find(line => line.startsWith('[') || line.startsWith('{'))
          
          if (jsonLine) {
            const testResults = JSON.parse(jsonLine)
            testResults.forEach(result => {
              logTest(result.name, result.passed, result.error)
            })
          }
        } catch (error) {
          logTest('Parse startup IPC results', false, error.message)
        }
      } else {
        logTest('Run startup IPC tests', false, \`Process exited with code \${code}\`)
      }
      
      resolve()
    })
    
    child.on('error', (error) => {
      logTest('Start Electron for startup IPC tests', false, error.message)
      resolve()
    })
  })
}

async function runAllTests() {
  console.log('🎯 Trial IPC Test Suite')
  console.log('=' .repeat(50))
  
  try {
    await testTrialIPC()
    await testStartupIPC()
    
  } catch (error) {
    console.error('Test suite failed:', error)
  }
  
  // Print summary
  console.log('\\n' + '='.repeat(50))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(50))
  console.log(\`Total Tests: \${totalTests}\`)
  console.log(\`Passed: \${passedTests}\`)
  console.log(\`Failed: \${failedTests.length}\`)
  console.log(\`Success Rate: \${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%\`)
  
  if (failedTests.length > 0) {
    console.log('\\n❌ Failed Tests:')
    failedTests.forEach(({ testName, error }) => {
      console.log(\`  - \${testName}\`)
      if (error) {
        console.log(\`    \${error}\`)
      }
    })
  }
  
  if (passedTests === totalTests) {
    console.log('\\n🎉 All IPC tests passed!')
  } else {
    console.log(\`\\n⚠️  \${failedTests.length} test(s) failed.\`)
  }
}

// Run the tests
runAllTests().catch(console.error)