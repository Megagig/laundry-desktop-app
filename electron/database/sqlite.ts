import Database from "better-sqlite3"
import path from "path"

const dbPath = path.join(process.cwd(), "laundry.db")

export const db = new Database(dbPath)


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