const fs = require('fs')
const path = require('path')

/**
 * Security Audit Script
 * Checks Electron application for common security issues
 */

console.log('🔒 Starting Security Audit...\n')

const results = {
  passed: [],
  warnings: [],
  failed: [],
  info: []
}

function addResult(type, check, status, details = '') {
  const result = { check, status, details }
  results[type].push(result)
  
  const icons = { passed: '✅', warnings: '⚠️', failed: '❌', info: 'ℹ️' }
  console.log(`${icons[type]} ${check}: ${status}${details ? ` - ${details}` : ''}`)
}

// Check 1: Main process security settings
function checkMainProcessSecurity() {
  console.log('\n📋 Checking Main Process Security...')
  
  try {
    const mainPath = path.join(__dirname, '..', 'electron', 'main.ts')
    const mainContent = fs.readFileSync(mainPath, 'utf8')
    
    // Check nodeIntegration
    if (mainContent.includes('nodeIntegration: false')) {
      addResult('passed', 'Node Integration', 'Disabled')
    } else {
      addResult('failed', 'Node Integration', 'Not properly disabled')
    }
    
    // Check contextIsolation
    if (mainContent.includes('contextIsolation: true')) {
      addResult('passed', 'Context Isolation', 'Enabled')
    } else {
      addResult('failed', 'Context Isolation', 'Not enabled')
    }
    
    // Check sandbox
    if (mainContent.includes('sandbox: false')) {
      addResult('warnings', 'Sandbox Mode', 'Disabled', 'Consider enabling for production')
    } else if (mainContent.includes('sandbox: true')) {
      addResult('passed', 'Sandbox Mode', 'Enabled')
    } else {
      addResult('warnings', 'Sandbox Mode', 'Not explicitly set')
    }
    
    // Check webSecurity
    if (mainContent.includes('webSecurity: true')) {
      addResult('passed', 'Web Security', 'Enabled')
    } else {
      addResult('failed', 'Web Security', 'Not enabled')
    }
    
    // Check allowRunningInsecureContent
    if (mainContent.includes('allowRunningInsecureContent: false')) {
      addResult('passed', 'Insecure Content', 'Blocked')
    } else {
      addResult('warnings', 'Insecure Content', 'Not explicitly blocked')
    }
    
    // Check enableRemoteModule
    if (mainContent.includes('enableRemoteModule: false')) {
      addResult('passed', 'Remote Module', 'Disabled')
    } else {
      addResult('warnings', 'Remote Module', 'Not explicitly disabled')
    }
    
    // Check for CSP
    if (mainContent.includes('Content-Security-Policy')) {
      addResult('passed', 'Content Security Policy', 'Implemented')
    } else {
      addResult('failed', 'Content Security Policy', 'Not implemented')
    }
    
    // Check for navigation protection
    if (mainContent.includes('will-navigate')) {
      addResult('passed', 'Navigation Protection', 'Implemented')
    } else {
      addResult('warnings', 'Navigation Protection', 'Not implemented')
    }
    
    // Check for new window protection
    if (mainContent.includes('setWindowOpenHandler')) {
      addResult('passed', 'New Window Protection', 'Implemented')
    } else {
      addResult('warnings', 'New Window Protection', 'Not implemented')
    }
    
  } catch (error) {
    addResult('failed', 'Main Process Check', 'Could not read main.ts', error.message)
  }
}

// Check 2: Preload script security
function checkPreloadSecurity() {
  console.log('\n📋 Checking Preload Script Security...')
  
  try {
    const preloadPath = path.join(__dirname, '..', 'electron', 'preload.ts')
    const preloadContent = fs.readFileSync(preloadPath, 'utf8')
    
    // Check contextBridge usage
    if (preloadContent.includes('contextBridge.exposeInMainWorld')) {
      addResult('passed', 'Context Bridge', 'Used correctly')
    } else {
      addResult('failed', 'Context Bridge', 'Not using contextBridge')
    }
    
    // Check for direct Node.js API exposure
    if (preloadContent.includes('require(') && !preloadContent.includes('contextBridge')) {
      addResult('failed', 'Node.js API Exposure', 'Direct require() usage detected')
    } else {
      addResult('passed', 'Node.js API Exposure', 'No direct exposure')
    }
    
    // Check for IPC usage
    if (preloadContent.includes('ipcRenderer.invoke')) {
      addResult('passed', 'IPC Communication', 'Using secure invoke pattern')
    } else {
      addResult('warnings', 'IPC Communication', 'No IPC communication found')
    }
    
  } catch (error) {
    addResult('failed', 'Preload Script Check', 'Could not read preload.ts', error.message)
  }
}

// Check 3: IPC Security
function checkIPCSecurity() {
  console.log('\n📋 Checking IPC Security...')
  
  try {
    // Check for validation middleware
    const middlewarePath = path.join(__dirname, '..', 'electron', 'middleware', 'ipc-validation.middleware.ts')
    if (fs.existsSync(middlewarePath)) {
      addResult('passed', 'IPC Validation Middleware', 'Implemented')
      
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')
      
      // Check for rate limiting
      if (middlewareContent.includes('checkRateLimit')) {
        addResult('passed', 'IPC Rate Limiting', 'Implemented')
      } else {
        addResult('warnings', 'IPC Rate Limiting', 'Not implemented')
      }
      
      // Check for input sanitization
      if (middlewareContent.includes('sanitizeObject')) {
        addResult('passed', 'Input Sanitization', 'Implemented')
      } else {
        addResult('warnings', 'Input Sanitization', 'Not implemented')
      }
      
    } else {
      addResult('warnings', 'IPC Validation Middleware', 'Not implemented')
    }
    
    // Check IPC handlers for session validation
    const ipcDir = path.join(__dirname, '..', 'electron', 'ipc')
    const ipcFiles = fs.readdirSync(ipcDir).filter(f => f.endsWith('.ts'))
    
    let sessionValidationCount = 0
    for (const file of ipcFiles) {
      const content = fs.readFileSync(path.join(ipcDir, file), 'utf8')
      if (content.includes('validateSession') || content.includes('sessionToken')) {
        sessionValidationCount++
      }
    }
    
    if (sessionValidationCount > 0) {
      addResult('passed', 'Session Validation', `Found in ${sessionValidationCount} IPC handlers`)
    } else {
      addResult('warnings', 'Session Validation', 'Not found in IPC handlers')
    }
    
  } catch (error) {
    addResult('failed', 'IPC Security Check', 'Could not check IPC files', error.message)
  }
}

// Check 4: Dependencies security
function checkDependenciesSecurity() {
  console.log('\n📋 Checking Dependencies Security...')
  
  try {
    const packagePath = path.join(__dirname, '..', 'package.json')
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Check for security-related dependencies
    const securityDeps = ['bcrypt', 'node-forge', 'helmet']
    const deps = { ...packageContent.dependencies, ...packageContent.devDependencies }
    
    for (const dep of securityDeps) {
      if (deps[dep]) {
        addResult('passed', `Security Dependency: ${dep}`, 'Installed', `Version: ${deps[dep]}`)
      } else {
        addResult('info', `Security Dependency: ${dep}`, 'Not installed')
      }
    }
    
    // Check for potentially dangerous dependencies
    const dangerousDeps = ['eval', 'vm2', 'node-pty']
    for (const dep of dangerousDeps) {
      if (deps[dep]) {
        addResult('warnings', `Potentially Dangerous: ${dep}`, 'Installed', 'Review usage carefully')
      }
    }
    
  } catch (error) {
    addResult('failed', 'Dependencies Check', 'Could not read package.json', error.message)
  }
}

// Check 5: File permissions and structure
function checkFileStructure() {
  console.log('\n📋 Checking File Structure Security...')
  
  try {
    // Check for sensitive files in wrong locations
    const sensitiveFiles = ['.env', 'private.key', 'secret.key', 'config.json']
    const rootDir = path.join(__dirname, '..')
    
    for (const file of sensitiveFiles) {
      const filePath = path.join(rootDir, file)
      if (fs.existsSync(filePath)) {
        if (file === '.env') {
          addResult('info', `Sensitive File: ${file}`, 'Found in root', 'Ensure it\'s in .gitignore')
        } else {
          addResult('warnings', `Sensitive File: ${file}`, 'Found in root', 'Consider moving to secure location')
        }
      }
    }
    
    // Check for .gitignore
    const gitignorePath = path.join(rootDir, '.gitignore')
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
      if (gitignoreContent.includes('.env')) {
        addResult('passed', 'Environment File Protection', '.env in .gitignore')
      } else {
        addResult('warnings', 'Environment File Protection', '.env not in .gitignore')
      }
    } else {
      addResult('warnings', 'Git Ignore', 'No .gitignore file found')
    }
    
  } catch (error) {
    addResult('failed', 'File Structure Check', 'Could not check file structure', error.message)
  }
}

// Run all checks
checkMainProcessSecurity()
checkPreloadSecurity()
checkIPCSecurity()
checkDependenciesSecurity()
checkFileStructure()

// Print summary
console.log('\n📊 Security Audit Summary:')
console.log(`✅ Passed: ${results.passed.length}`)
console.log(`⚠️  Warnings: ${results.warnings.length}`)
console.log(`❌ Failed: ${results.failed.length}`)
console.log(`ℹ️  Info: ${results.info.length}`)

// Calculate security score
const totalChecks = results.passed.length + results.warnings.length + results.failed.length
const score = Math.round((results.passed.length / totalChecks) * 100)

console.log(`\n🎯 Security Score: ${score}%`)

if (score >= 90) {
  console.log('🟢 Excellent security posture!')
} else if (score >= 75) {
  console.log('🟡 Good security, but room for improvement')
} else if (score >= 60) {
  console.log('🟠 Moderate security, several issues to address')
} else {
  console.log('🔴 Poor security, immediate attention required')
}

// Recommendations
if (results.failed.length > 0) {
  console.log('\n🚨 Critical Issues to Fix:')
  results.failed.forEach(item => {
    console.log(`   • ${item.check}: ${item.status}`)
  })
}

if (results.warnings.length > 0) {
  console.log('\n⚠️  Recommendations:')
  results.warnings.forEach(item => {
    console.log(`   • ${item.check}: ${item.details || item.status}`)
  })
}

console.log('\n✅ Security audit complete!')