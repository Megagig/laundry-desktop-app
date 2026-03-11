import { ipcMain, type IpcMainInvokeEvent } from 'electron'

/**
 * IPC Validation Middleware
 * Provides input validation, sanitization, and rate limiting for IPC calls
 */

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Configuration
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // Max requests per window
const MAX_STRING_LENGTH = 10000 // Max string length
const MAX_ARRAY_LENGTH = 1000 // Max array length
const MAX_OBJECT_DEPTH = 10 // Max object nesting depth

/**
 * Sanitize string input
 */
function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Expected string input')
  }
  
  if (input.length > MAX_STRING_LENGTH) {
    throw new Error(`String too long (max ${MAX_STRING_LENGTH} characters)`)
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .trim()
}

/**
 * Validate and sanitize number input
 */
function validateNumber(input: any): number {
  const num = Number(input)
  
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Invalid number')
  }
  
  if (num < -1000000 || num > 1000000) {
    throw new Error('Number out of safe range')
  }
  
  return num
}

/**
 * Validate array input
 */
function validateArray(input: any): any[] {
  if (!Array.isArray(input)) {
    throw new Error('Expected array input')
  }
  
  if (input.length > MAX_ARRAY_LENGTH) {
    throw new Error(`Array too long (max ${MAX_ARRAY_LENGTH} items)`)
  }
  
  return input
}

/**
 * Validate object depth to prevent deep nesting attacks
 */
function validateObjectDepth(obj: any, depth = 0): void {
  if (depth > MAX_OBJECT_DEPTH) {
    throw new Error(`Object nesting too deep (max ${MAX_OBJECT_DEPTH} levels)`)
  }
  
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        validateObjectDepth(obj[key], depth + 1)
      }
    }
  }
}

/**
 * Sanitize object input recursively
 */
function sanitizeObject(input: any): any {
  if (input === null || input === undefined) {
    return input
  }
  
  if (typeof input === 'string') {
    return sanitizeString(input)
  }
  
  if (typeof input === 'number') {
    return validateNumber(input)
  }
  
  if (typeof input === 'boolean') {
    return input
  }
  
  if (Array.isArray(input)) {
    const validatedArray = validateArray(input)
    return validatedArray.map(item => sanitizeObject(item))
  }
  
  if (typeof input === 'object') {
    validateObjectDepth(input)
    const sanitized: any = {}
    
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        const sanitizedKey = sanitizeString(key)
        sanitized[sanitizedKey] = sanitizeObject(input[key])
      }
    }
    
    return sanitized
  }
  
  throw new Error(`Unsupported input type: ${typeof input}`)
}

/**
 * Check rate limiting for sender
 */
function checkRateLimit(senderId: number): void {
  const now = Date.now()
  const key = `sender_${senderId}`
  const limit = rateLimitMap.get(key)
  
  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return
  }
  
  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    throw new Error('Rate limit exceeded. Please try again later.')
  }
  
  limit.count++
}

/**
 * Validate session token format
 */
function validateSessionToken(token: any): string {
  if (typeof token !== 'string') {
    throw new Error('Session token must be a string')
  }
  
  if (token.length < 10 || token.length > 500) {
    throw new Error('Invalid session token format')
  }
  
  // Check for basic token format (alphanumeric + some special chars)
  if (!/^[a-zA-Z0-9._-]+$/.test(token)) {
    throw new Error('Session token contains invalid characters')
  }
  
  return token
}

/**
 * IPC Validation Middleware
 */
export function createIPCValidationMiddleware() {
  const originalHandle = ipcMain.handle.bind(ipcMain)
  
  // Override ipcMain.handle to add validation
  ipcMain.handle = function(channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => any) {
    const wrappedListener = async (event: IpcMainInvokeEvent, ...args: any[]) => {
      try {
        // Rate limiting
        checkRateLimit(event.sender.id)
        
        // Log IPC call for security monitoring
        console.log(`IPC Call: ${channel} from sender ${event.sender.id}`)
        
        // Validate and sanitize arguments
        const sanitizedArgs = args.map((arg, index) => {
          try {
            // Special handling for session tokens (usually first argument)
            if (index === 0 && typeof arg === 'string' && arg.length > 20) {
              return validateSessionToken(arg)
            }
            
            return sanitizeObject(arg)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            throw new Error(`Invalid argument ${index}: ${errorMessage}`)
          }
        })
        
        // Call original handler with sanitized arguments
        return await listener(event, ...sanitizedArgs)
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`IPC Validation Error for ${channel}:`, errorMessage)
        return {
          success: false,
          error: `Validation failed: ${errorMessage}`
        }
      }
    }
    
    return originalHandle(channel, wrappedListener)
  }
}

/**
 * Clean up rate limiting data periodically
 */
export function startRateLimitCleanup() {
  setInterval(() => {
    const now = Date.now()
    for (const [key, limit] of rateLimitMap.entries()) {
      if (now > limit.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }, RATE_LIMIT_WINDOW)
}

/**
 * Get current rate limit stats (for monitoring)
 */
export function getRateLimitStats() {
  return {
    activeClients: rateLimitMap.size,
    rateLimitWindow: RATE_LIMIT_WINDOW,
    maxRequestsPerWindow: RATE_LIMIT_MAX_REQUESTS
  }
}