const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const path = require('path')

// Set correct database path
const dbPath = path.join(__dirname, 'laundry.db')
process.env.DATABASE_URL = `file:${dbPath}`

const prisma = new PrismaClient()

// Permission definitions
const PERMISSIONS = [
  { name: 'view_dashboard', description: 'View dashboard and metrics', module: 'DASHBOARD' },
  { name: 'view_customer', description: 'View customer information', module: 'CUSTOMER' },
  { name: 'create_customer', description: 'Create new customers', module: 'CUSTOMER' },
  { name: 'edit_customer', description: 'Edit customer information', module: 'CUSTOMER' },
  { name: 'delete_customer', description: 'Delete customers', module: 'CUSTOMER' },
  { name: 'view_order', description: 'View orders', module: 'ORDER' },
  { name: 'create_order', description: 'Create new orders', module: 'ORDER' },
  { name: 'edit_order', description: 'Edit orders', module: 'ORDER' },
  { name: 'cancel_order', description: 'Cancel orders', module: 'ORDER' },
  { name: 'update_order_status', description: 'Update order status', module: 'ORDER' },
  { name: 'delete_order', description: 'Delete orders', module: 'ORDER' },
  { name: 'view_services', description: 'View services and pricing', module: 'SERVICE' },
  { name: 'manage_services', description: 'Create, edit, delete services', module: 'SERVICE' },
  { name: 'view_payment', description: 'View payment records', module: 'PAYMENT' },
  { name: 'process_payment', description: 'Process payments', module: 'PAYMENT' },
  { name: 'refund_payment', description: 'Process refunds', module: 'PAYMENT' },
  { name: 'view_outstanding_payments', description: 'View outstanding balances', module: 'PAYMENT' },
  { name: 'view_expense', description: 'View expenses', module: 'EXPENSE' },
  { name: 'create_expense', description: 'Create expenses', module: 'EXPENSE' },
  { name: 'edit_expense', description: 'Edit expenses', module: 'EXPENSE' },
  { name: 'delete_expense', description: 'Delete expenses', module: 'EXPENSE' },
  { name: 'view_reports', description: 'View reports', module: 'REPORT' },
  { name: 'view_revenue', description: 'View revenue reports', module: 'REPORT' },
  { name: 'view_profit_loss', description: 'View profit/loss reports', module: 'REPORT' },
  { name: 'export_reports', description: 'Export reports', module: 'REPORT' },
  { name: 'print_receipt', description: 'Print receipts', module: 'PRINTER' },
  { name: 'reprint_receipt', description: 'Reprint old receipts', module: 'PRINTER' },
  { name: 'manage_printers', description: 'Manage printer settings', module: 'PRINTER' },
  { name: 'view_settings', description: 'View application settings', module: 'SETTINGS' },
  { name: 'manage_settings', description: 'Modify application settings', module: 'SETTINGS' },
  { name: 'create_backup', description: 'Create database backups', module: 'BACKUP' },
  { name: 'restore_backup', description: 'Restore from backup', module: 'BACKUP' },
  { name: 'export_data', description: 'Export data to CSV', module: 'BACKUP' },
  { name: 'view_users', description: 'View user list', module: 'USER' },
  { name: 'create_user', description: 'Create new users', module: 'USER' },
  { name: 'edit_user', description: 'Edit user information', module: 'USER' },
  { name: 'delete_user', description: 'Delete users', module: 'USER' },
  { name: 'reset_user_password', description: 'Reset user passwords', module: 'USER' },
  { name: 'manage_roles', description: 'Manage roles and permissions', module: 'USER' },
  { name: 'view_audit_logs', description: 'View audit logs', module: 'AUDIT' },
  { name: 'export_audit_logs', description: 'Export audit logs', module: 'AUDIT' },
  { name: 'manage_license', description: 'Manage software license', module: 'LICENSE' },
]

const ROLES = [
  {
    name: 'ADMIN',
    description: 'Full system access - can manage everything',
    isSystem: true,
    permissions: PERMISSIONS.map(p => p.name),
  },
  {
    name: 'MANAGER',
    description: 'Operations management - can manage business operations',
    isSystem: true,
    permissions: [
      'view_dashboard',
      'view_customer', 'create_customer', 'edit_customer', 'delete_customer',
      'view_order', 'create_order', 'edit_order', 'cancel_order', 'update_order_status',
      'view_services', 'manage_services',
      'view_payment', 'process_payment', 'refund_payment', 'view_outstanding_payments',
      'view_expense', 'create_expense', 'edit_expense', 'delete_expense',
      'view_reports', 'view_revenue', 'view_profit_loss', 'export_reports',
      'print_receipt', 'reprint_receipt',
      'view_settings',
      'create_backup', 'restore_backup', 'export_data',
      'view_audit_logs',
    ],
  },
  {
    name: 'CASHIER',
    description: 'Front desk operations - can handle customers and orders',
    isSystem: true,
    permissions: [
      'view_dashboard',
      'view_customer', 'create_customer', 'edit_customer',
      'view_order', 'create_order', 'update_order_status',
      'view_services',
      'view_payment', 'process_payment', 'view_outstanding_payments',
      'print_receipt', 'reprint_receipt',
      'view_settings',
    ],
  },
  {
    name: 'ATTENDANT',
    description: 'Basic operations - can update order status',
    isSystem: true,
    permissions: [
      'view_dashboard',
      'view_customer',
      'view_order', 'update_order_status',
      'view_services',
      'print_receipt',
    ],
  },
]

async function main() {
  console.log('🔐 Starting security seed...')

  // 1. Create Permissions
  console.log('📝 Creating permissions...')
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    })
  }
  console.log(`✓ Created ${PERMISSIONS.length} permissions`)

  // 2. Create Roles and assign permissions
  console.log('👥 Creating roles...')
  for (const roleData of ROLES) {
    const { permissions, ...roleInfo } = roleData
    
    const role = await prisma.role.upsert({
      where: { name: roleInfo.name },
      update: {},
      create: roleInfo,
    })

    console.log(`  ↳ Assigning permissions to ${role.name}...`)
    for (const permName of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permName },
      })

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        })
      }
    }
    console.log(`  ✓ ${role.name}: ${permissions.length} permissions assigned`)
  }

  // 3. Create Default Admin User
  console.log('👤 Creating default admin user...')
  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  })

  if (adminRole) {
    const passwordHash = await bcrypt.hash('AdminPass@247', 12)
    
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        fullName: 'System Administrator',
        email: 'admin@laundrypro.com',
        username: 'admin',
        passwordHash,
        roleId: adminRole.id,
        isActive: true,
      },
    })
    console.log(`✓ Admin user created: ${adminUser.username}`)
    console.log(`  Email: ${adminUser.email}`)
    console.log(`  Default Password: AdminPass@247`)
    console.log(`  ⚠️  IMPORTANT: Change this password immediately after first login!`)
  }

  console.log('\n✅ Security seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - Permissions: ${PERMISSIONS.length}`)
  console.log(`  - Roles: ${ROLES.length}`)
  console.log(`  - Default Admin: admin / admin123`)
  console.log('\n⚠️  Remember to change the default admin password!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
