import Database from "better-sqlite3"
import path from "path"

const dbPath = path.join(process.cwd(), "laundry.db")

export const db: Database.Database = new Database(dbPath)


db.prepare(`
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  phone TEXT
)
`).run()

db.prepare(`
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  total INTEGER,
  created_at TEXT
)
`).run()

db.prepare(`
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  item_name TEXT,
  price INTEGER
)
`).run()

db.prepare(`
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  price INTEGER
)
`).run()

const services = db.prepare("SELECT COUNT(*) as count FROM services").get() as { count: number }

if (services.count === 0) {

  const insert = db.prepare(`
    INSERT INTO services (name, price)
    VALUES (?, ?)
  `)

  insert.run("Wash Shirt", 500)
  insert.run("Wash Trouser", 700)
  insert.run("Dry Clean Suit", 2500)

}