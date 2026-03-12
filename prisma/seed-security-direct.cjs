const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const path = require('path')

const dbPath = path.join(__dirname, 'laundry.db')
const db = new sqlite3.Database(dbPath)

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
  { name: 'ADMIN', description: 'Full system access - can manage everything', isSystem: true, permissions: PERMISSIONS.map(p => p.name) },
  { name: 'MANAGER', description: 'Operations management', isSystem: true, permissions: [
    'view_dashboard', 'view_customer', 'create_customer', 'edit_customer', 'delete_customer',
    'view_order', 'create_order', 'edit_order', 'cancel_order', 'update_order_status',
    'view_services', 'manage_services', 'view_payment', 'process_payment', 'refund_payment',
    'view_outstanding_payments', 'view_expense', 'create_expense', 'edit_expense', 'delete_expense',
    'view_reports', 'view_revenue', 'view_profit_loss', 'export_reports',
    'print_receipt', 'reprint_receipt', 'view_settings', 'create_backup', 'restore_backup',
    'export_data', 'view_audit_logs',
  ]},
  { name: 'CASHIER', description: 'Front desk operations', isSystem: true, permissions: [
    'view_dashboard', 'view_customer', 'create_customer', 'edit_customer',
    'view_order', 'create_order', 'update_order_status', 'view_services',
    'view_payment', 'process_payment', 'view_outstanding_payments',
    'print_receipt', 'reprint_receipt', 'view_settings',
  ]},
  { name: 'ATTENDANT', description: 'Basic operations', isSystem: true, permissions: [
    'view_dashboard', 'view_customer', 'view_order', 'update_order_status',
    'view_services', 'print_receipt',
  ]},
]

async function seed() {
  console.log('🔐 Starting security seed (direct SQL)...')
  
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // 1. Insert Permissions
        console.log('📝 Creating permissions...')
        const permStmt = db.prepare('INSERT OR IGNORE INTO permissions (name, description, module, createdAt) VALUES (?, ?, ?, datetime("now"))')
        for (const perm of PERMISSIONS) {
          permStmt.run(perm.name, perm.description, perm.module)
        }
        permStmt.finalize()
        console.log(`✓ Created ${PERMISSIONS.length} permissions`)

        // 2. Insert Roles
        console.log('👥 Creating roles...')
        const roleStmt = db.prepare('INSERT OR IGNORE INTO roles (name, description, isSystem, createdAt) VALUES (?, ?, ?, datetime("now"))')
        for (const role of ROLES) {
          roleStmt.run(role.name, role.description, role.isSystem ? 1 : 0)
        }
        roleStmt.finalize()
        console.log(`✓ Created ${ROLES.length} roles`)

        // 3. Assign Permissions to Roles
        console.log('🔗 Assigning permissions to roles...')
        for (const roleData of ROLES) {
          const role = await new Promise((res, rej) => {
            db.get('SELECT id FROM roles WHERE name = ?', [roleData.name], (err, row) => {
              if (err) rej(err)
              else res(row)
            })
          })

          if (role) {
            for (const permName of roleData.permissions) {
              const perm = await new Promise((res, rej) => {
                db.get('SELECT id FROM permissions WHERE name = ?', [permName], (err, row) => {
                  if (err) rej(err)
                  else res(row)
                })
              })

              if (perm) {
                db.run('INSERT OR IGNORE INTO role_permissions (roleId, permissionId) VALUES (?, ?)', 
                  [role.id, perm.id])
              }
            }
            console.log(`  ✓ ${roleData.name}: ${roleData.permissions.length} permissions assigned`)
          }
        }

        // 4. Create Default Admin User
        console.log('👤 Creating default admin user...')
        const adminRole = await new Promise((res, rej) => {
          db.get('SELECT id FROM roles WHERE name = ?', ['ADMIN'], (err, row) => {
            if (err) rej(err)
            else res(row)
          })
        })

        if (adminRole) {
          const passwordHash = await bcrypt.hash('admin123', 12)
          
          db.run(`INSERT OR IGNORE INTO users (fullName, email, username, passwordHash, roleId, isActive, createdAt, updatedAt) 
                  VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            ['System Administrator', 'admin@laundrypro.local', 'admin', passwordHash, adminRole.id, 1],
            function(err) {
              if (err) {
                console.error('Error creating admin:', err)
              } else {
                console.log(`✓ Admin user created: admin`)
                console.log(`  Email: admin@laundrypro.local`)
                console.log(`  Default Password: admin123`)
                console.log(`  ⚠️  IMPORTANT: Change this password immediately after first login!`)
              }
            }
          )
        }

        // Wait a bit for async operations
        setTimeout(() => {
          console.log('\n✅ Security seed completed successfully!')
          console.log('\n📊 Summary:')
          console.log(`  - Permissions: ${PERMISSIONS.length}`)
          console.log(`  - Roles: ${ROLES.length}`)
          console.log(`  - Default Admin: admin / admin123`)
          console.log('\n⚠️  Remember to change the default admin password!')
          
          db.close(() => {
            resolve()
          })
        }, 1000)

      } catch (error) {
        console.error('❌ Error:', error)
        db.close(() => {
          reject(error)
        })
      }
    })
  })
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
