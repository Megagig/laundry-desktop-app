/**
 * Phase 12: Anti-Debugging Service
 * Detects and prevents debugging attempts
 */

import { EventEmitter } from 'events'

interface DebugDetectionResult {
  detected: boolean
  method: string
  timestamp: Date
  details?: string
}

class AntiDebugService extends EventEmitter {
  private isMonitoring = false
  private detectionInterval: NodeJS.Timeout | null = null
  private detectionMethods: Array<() => boolean> = []

  constructor() {
    super()
    this.initializeDetectionMethods()
  }

  /**
   * Start monitoring for debugging attempts
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      return
    }

    this.isMonitoring = true
    this.detectionInterval = setInterval(() => {
      this.performDetectionCheck()
    }, intervalMs)

    console.log('🛡️  Anti-debug monitoring started')
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval)
      this.detectionInterval = null
    }
    this.isMonitoring = false
    console.log('🛡️  Anti-debug monitoring stopped')
  }

  /**
   * Initialize detection methods
   */
  private initializeDetectionMethods(): void {
    this.detectionMethods = [
      this.detectDebuggerStatement.bind(this),
      this.detectConsoleOpen.bind(this),
      this.detectNodeInspector.bind(this),
      this.detectTimingAttack.bind(this),
      this.detectFunctionToString.bind(this)
    ]
  }

  /**
   * Perform comprehensive detection check
   */
  private performDetectionCheck(): void {
    for (const method of this.detectionMethods) {
      try {
        if (method()) {
          const result: DebugDetectionResult = {
            detected: true,
            method: method.name,
            timestamp: new Date()
          }
          
          this.emit('debugDetected', result)
          this.handleDebugDetection(result)
          return
        }
      } catch (error) {
        // Silently continue if detection method fails
      }
    }
  }

  /**
   * Handle debug detection
   */
  private handleDebugDetection(result: DebugDetectionResult): void {
    console.warn('🚨 Debug attempt detected:', result.method)
    
    // In production, you might want to:
    // 1. Log the incident
    // 2. Disable functionality
    // 3. Exit the application
    // 4. Alert administrators
    
    // For now, just emit an event
    this.emit('securityViolation', {
      type: 'DEBUG_DETECTED',
      details: result
    })
  }

  /**
   * Detection Method 1: Debugger statement timing
   */
  private detectDebuggerStatement(): boolean {
    const start = performance.now()
    debugger
    const end = performance.now()
    
    // If debugger is attached, this will take significantly longer
    return (end - start) > 100
  }

  /**
   * Detection Method 2: Console/DevTools detection
   */
  private detectConsoleOpen(): boolean {
    if (typeof window === 'undefined') {
      return false // Not in browser environment
    }

    // Check window dimensions for dev tools
    const threshold = 160
    return (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    )
  }

  /**
   * Detection Method 3: Node.js inspector detection
   */
  private detectNodeInspector(): boolean {
    // Check environment variables
    if (process.env.NODE_OPTIONS?.includes('--inspect') ||
        process.env.NODE_OPTIONS?.includes('--debug')) {
      return true
    }

    // Check command line arguments
    return process.argv.some(arg => 
      arg.includes('--inspect') || 
      arg.includes('--debug') ||
      arg.includes('--inspect-brk')
    )
  }

  /**
   * Detection Method 4: Timing attack detection
   */
  private detectTimingAttack(): boolean {
    const iterations = 1000
    const start = performance.now()
    
    for (let i = 0; i < iterations; i++) {
      // Simple operation that might be slowed by debugging
      Math.random()
    }
    
    const end = performance.now()
    const avgTime = (end - start) / iterations
    
    // If average time per operation is too high, might indicate debugging
    return avgTime > 0.1
  }

  /**
   * Detection Method 5: Function toString detection
   */
  private detectFunctionToString(): boolean {
    try {
      // Check if Function.prototype.toString has been modified
      const originalToString = Function.prototype.toString
      const testFunction = function() { return 'test' }
      
      const result = originalToString.call(testFunction)
      
      // If the function source doesn't contain expected content, might be modified
      return !result.includes('return \'test\'')
    } catch (error) {
      return true // If error occurs, assume tampering
    }
  }

  /**
   * Get current monitoring status
   */
  getStatus(): { isMonitoring: boolean; methodCount: number } {
    return {
      isMonitoring: this.isMonitoring,
      methodCount: this.detectionMethods.length
    }
  }
}

export const antiDebugService = new AntiDebugService()
export { AntiDebugService }
export type { DebugDetectionResult }