import inquirer from 'inquirer'
import chalk from 'chalk'
import { v4 as uuidv4 } from 'uuid'
import type { LicensePayload } from './crypto.service.js'

export interface LicenseGenerationOptions {
  machineId: string
  issuedTo: string
  email: string
  company?: string
  licenseType: 'TRIAL' | 'STANDARD' | 'PROFESSIONAL' | 'ENTERPRISE'
  features: string[]
  maxUsers: number
  expiryDays?: number
  customExpiry?: string
}

export interface BatchGenerationOptions {
  count: number
  licenseType: 'TRIAL' | 'STANDARD' | 'PROFESSIONAL' | 'ENTERPRISE'
  features: string[]
  maxUsers: number
  expiryDays?: number
  prefix?: string
}

/**
 * CLI service for interactive license generation
 * Provides user-friendly prompts and validation
 */
export class CLIService {
  private readonly LICENSE_TYPES = [
    { name: 'Trial (14 days)', value: 'TRIAL' },
    { name: 'Standard', value: 'STANDARD' },
    { name: 'Professional', value: 'PROFESSIONAL' },
    { name: 'Enterprise', value: 'ENTERPRISE' }
  ]

  private readonly AVAILABLE_FEATURES = [
    { name: 'All Features', value: 'all' },
    { name: 'Customer Management', value: 'customers' },
    { name: 'Order Management', value: 'orders' },
    { name: 'Payment Processing', value: 'payments' },
    { name: 'Expense Tracking', value: 'expenses' },
    { name: 'Reporting & Analytics', value: 'reports' },
    { name: 'Backup & Restore', value: 'backup' },
    { name: 'User Management', value: 'users' },
    { name: 'Audit Logging', value: 'audit' },
    { name: 'Print Management', value: 'printing' },
    { name: 'Service Management', value: 'services' }
  ]

  /**
   * Interactive license generation prompt
   */
  async promptLicenseGeneration(): Promise<LicenseGenerationOptions> {
    console.log(chalk.blue.bold('\n🎫 License Generation Wizard\n'))

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'machineId',
        message: 'Machine ID (format: LND-XXXXXXXX):',
        validate: (input: string) => {
          if (!input.trim()) return 'Machine ID is required'
          if (!input.match(/^LND-[A-F0-9]{8}$/)) {
            return 'Machine ID must be in format: LND-XXXXXXXX (8 hex characters)'
          }
          return true
        }
      },
      {
        type: 'input',
        name: 'issuedTo',
        message: 'Customer name:',
        validate: (input: string) => input.trim() ? true : 'Customer name is required'
      },
      {
        type: 'input',
        name: 'email',
        message: 'Customer email:',
        validate: (input: string) => {
          if (!input.trim()) return 'Email is required'
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return emailRegex.test(input) ? true : 'Please enter a valid email address'
        }
      },
      {
        type: 'input',
        name: 'company',
        message: 'Company name (optional):'
      },
      {
        type: 'list',
        name: 'licenseType',
        message: 'License type:',
        choices: this.LICENSE_TYPES
      },
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select features:',
        choices: this.AVAILABLE_FEATURES,
        default: ['all'],
        validate: (choices: string[]) => {
          return choices.length > 0 ? true : 'Please select at least one feature'
        }
      },
      {
        type: 'number',
        name: 'maxUsers',
        message: 'Maximum number of users:',
        default: 1,
        validate: (input: number) => {
          return input > 0 && input <= 100 ? true : 'Max users must be between 1 and 100'
        }
      },
      {
        type: 'list',
        name: 'expiryType',
        message: 'License expiry:',
        choices: [
          { name: 'Never expires (Lifetime)', value: 'never' },
          { name: '30 days', value: '30' },
          { name: '90 days', value: '90' },
          { name: '1 year', value: '365' },
          { name: '2 years', value: '730' },
          { name: 'Custom date', value: 'custom' }
        ],
        when: (answers: any) => answers.licenseType !== 'TRIAL'
      },
      {
        type: 'input',
        name: 'customExpiry',
        message: 'Custom expiry date (YYYY-MM-DD):',
        when: (answers: any) => answers.expiryType === 'custom',
        validate: (input: string) => {
          const date = new Date(input)
          if (isNaN(date.getTime())) return 'Please enter a valid date (YYYY-MM-DD)'
          if (date <= new Date()) return 'Expiry date must be in the future'
          return true
        }
      }
    ])

    // Process expiry
    let expiryDays: number | undefined
    let customExpiry: string | undefined

    if (answers.licenseType === 'TRIAL') {
      expiryDays = 14
    } else if (answers.expiryType === 'custom') {
      customExpiry = answers.customExpiry
    } else if (answers.expiryType !== 'never') {
      expiryDays = parseInt(answers.expiryType)
    }

    return {
      machineId: answers.machineId.toUpperCase(),
      issuedTo: answers.issuedTo.trim(),
      email: answers.email.toLowerCase().trim(),
      company: answers.company?.trim() || undefined,
      licenseType: answers.licenseType,
      features: answers.features,
      maxUsers: answers.maxUsers,
      expiryDays,
      customExpiry
    }
  }

  /**
   * Interactive batch generation prompt
   */
  async promptBatchGeneration(): Promise<BatchGenerationOptions> {
    console.log(chalk.blue.bold('\n📦 Batch License Generation\n'))

    const answers = await inquirer.prompt([
      {
        type: 'number',
        name: 'count',
        message: 'Number of licenses to generate:',
        default: 10,
        validate: (input: number) => {
          return input > 0 && input <= 1000 ? true : 'Count must be between 1 and 1000'
        }
      },
      {
        type: 'input',
        name: 'prefix',
        message: 'Customer name prefix (optional):',
        default: 'Customer'
      },
      {
        type: 'list',
        name: 'licenseType',
        message: 'License type:',
        choices: this.LICENSE_TYPES
      },
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select features:',
        choices: this.AVAILABLE_FEATURES,
        default: ['all'],
        validate: (choices: string[]) => {
          return choices.length > 0 ? true : 'Please select at least one feature'
        }
      },
      {
        type: 'number',
        name: 'maxUsers',
        message: 'Maximum number of users:',
        default: 1,
        validate: (input: number) => {
          return input > 0 && input <= 100 ? true : 'Max users must be between 1 and 100'
        }
      },
      {
        type: 'list',
        name: 'expiryType',
        message: 'License expiry:',
        choices: [
          { name: 'Never expires (Lifetime)', value: 'never' },
          { name: '30 days', value: '30' },
          { name: '90 days', value: '90' },
          { name: '1 year', value: '365' },
          { name: '2 years', value: '730' }
        ],
        when: (answers: any) => answers.licenseType !== 'TRIAL'
      }
    ])

    // Process expiry
    let expiryDays: number | undefined

    if (answers.licenseType === 'TRIAL') {
      expiryDays = 14
    } else if (answers.expiryType !== 'never') {
      expiryDays = parseInt(answers.expiryType)
    }

    return {
      count: answers.count,
      licenseType: answers.licenseType,
      features: answers.features,
      maxUsers: answers.maxUsers,
      expiryDays,
      prefix: answers.prefix?.trim() || 'Customer'
    }
  }

  /**
   * Convert CLI options to license payload
   */
  createLicensePayload(options: LicenseGenerationOptions): LicensePayload {
    const now = new Date()
    let expiresAt: string | undefined

    if (options.customExpiry) {
      expiresAt = new Date(options.customExpiry).toISOString()
    } else if (options.expiryDays) {
      const expiry = new Date(now)
      expiry.setDate(expiry.getDate() + options.expiryDays)
      expiresAt = expiry.toISOString()
    }

    return {
      licenseId: uuidv4(),
      machineId: options.machineId,
      issuedTo: options.issuedTo,
      email: options.email,
      company: options.company,
      licenseType: options.licenseType,
      features: options.features,
      maxUsers: options.maxUsers,
      issuedAt: now.toISOString(),
      expiresAt,
      product: 'LaundryPro',
      version: '1.0.0'
    }
  }

  /**
   * Generate machine ID for batch generation
   */
  generateMachineId(): string {
    const chars = '0123456789ABCDEF'
    let result = 'LND-'
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Generate email for batch generation
   */
  generateEmail(name: string, index: number): string {
    const cleanName = name.toLowerCase().replace(/\s+/g, '')
    return `${cleanName}${index}@example.com`
  }

  /**
   * Display license information
   */
  displayLicenseInfo(payload: LicensePayload, licenseKey: string): void {
    console.log(chalk.green.bold('\n✅ License Generated Successfully!\n'))
    
    console.log(chalk.cyan('License Details:'))
    console.log(`  License ID: ${chalk.white(payload.licenseId)}`)
    console.log(`  Machine ID: ${chalk.white(payload.machineId)}`)
    console.log(`  Issued To: ${chalk.white(payload.issuedTo)}`)
    console.log(`  Email: ${chalk.white(payload.email)}`)
    if (payload.company) {
      console.log(`  Company: ${chalk.white(payload.company)}`)
    }
    console.log(`  License Type: ${chalk.white(payload.licenseType)}`)
    console.log(`  Features: ${chalk.white(payload.features.join(', '))}`)
    console.log(`  Max Users: ${chalk.white(payload.maxUsers)}`)
    console.log(`  Issued At: ${chalk.white(new Date(payload.issuedAt).toLocaleString())}`)
    
    if (payload.expiresAt) {
      const expiryDate = new Date(payload.expiresAt)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      console.log(`  Expires At: ${chalk.white(expiryDate.toLocaleString())} ${chalk.gray(`(${daysUntilExpiry} days)`)}`)
    } else {
      console.log(`  Expires At: ${chalk.white('Never (Lifetime)')}`)
    }

    console.log(chalk.cyan('\nLicense Key:'))
    console.log(chalk.yellow(this.formatLicenseKey(licenseKey)))
    
    console.log(chalk.gray('\n💡 Copy the license key above and provide it to the customer.'))
    console.log(chalk.gray('⚠️  Keep this information secure and do not share publicly.'))
  }

  /**
   * Format license key for display (with line breaks)
   */
  private formatLicenseKey(licenseKey: string): string {
    const chunkSize = 64
    const chunks = []
    
    for (let i = 0; i < licenseKey.length; i += chunkSize) {
      chunks.push(licenseKey.substring(i, i + chunkSize))
    }
    
    return chunks.join('\n')
  }

  /**
   * Display error message
   */
  displayError(message: string, error?: Error): void {
    console.log(chalk.red.bold('\n❌ Error:'), chalk.red(message))
    if (error) {
      console.log(chalk.gray(`Details: ${error.message}`))
    }
  }

  /**
   * Display success message
   */
  displaySuccess(message: string): void {
    console.log(chalk.green.bold('\n✅'), chalk.green(message))
  }

  /**
   * Display warning message
   */
  displayWarning(message: string): void {
    console.log(chalk.yellow.bold('\n⚠️'), chalk.yellow(message))
  }

  /**
   * Display info message
   */
  displayInfo(message: string): void {
    console.log(chalk.blue.bold('\nℹ️'), chalk.blue(message))
  }

  /**
   * Confirm action
   */
  async confirmAction(message: string): Promise<boolean> {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        default: false
      }
    ])
    
    return answer.confirmed
  }

  /**
   * Prompt for license ID
   */
  async promptLicenseId(message: string = 'Enter license ID:'): Promise<string> {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'licenseId',
        message,
        validate: (input: string) => input.trim() ? true : 'License ID is required'
      }
    ])
    
    return answer.licenseId.trim()
  }

  /**
   * Prompt for revocation reason
   */
  async promptRevocationReason(): Promise<string> {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'reason',
        message: 'Reason for revocation:',
        choices: [
          'License violation',
          'Payment issue',
          'Customer request',
          'Security breach',
          'Duplicate license',
          'Other'
        ]
      },
      {
        type: 'input',
        name: 'customReason',
        message: 'Please specify:',
        when: (answers: any) => answers.reason === 'Other',
        validate: (input: string) => input.trim() ? true : 'Please specify the reason'
      }
    ])
    
    return answer.customReason || answer.reason
  }

  /**
   * Prompt for new expiry date
   */
  async promptNewExpiryDate(): Promise<string> {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'expiryType',
        message: 'New expiry date:',
        choices: [
          { name: '30 days from now', value: '30' },
          { name: '90 days from now', value: '90' },
          { name: '1 year from now', value: '365' },
          { name: '2 years from now', value: '730' },
          { name: 'Custom date', value: 'custom' },
          { name: 'Never expires (Lifetime)', value: 'never' }
        ]
      },
      {
        type: 'input',
        name: 'customDate',
        message: 'Custom expiry date (YYYY-MM-DD):',
        when: (answers: any) => answers.expiryType === 'custom',
        validate: (input: string) => {
          const date = new Date(input)
          if (isNaN(date.getTime())) return 'Please enter a valid date (YYYY-MM-DD)'
          if (date <= new Date()) return 'Expiry date must be in the future'
          return true
        }
      }
    ])

    if (answer.expiryType === 'never') {
      return ''
    } else if (answer.expiryType === 'custom') {
      return new Date(answer.customDate).toISOString()
    } else {
      const days = parseInt(answer.expiryType)
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + days)
      return expiry.toISOString()
    }
  }
}

export const cliService = new CLIService()