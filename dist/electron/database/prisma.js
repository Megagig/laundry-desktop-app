import { PrismaClient } from "@prisma/client";
import path from "path";
import { app } from "electron";
// Determine database path based on environment
const getDatabasePath = () => {
    if (app.isPackaged) {
        return path.join(app.getPath("userData"), "laundry.db");
    }
    return path.join(process.cwd(), "prisma", "laundry.db");
};
// Set DATABASE_URL environment variable for Prisma
process.env.DATABASE_URL = `file:${getDatabasePath()}`;
// Create Prisma Client instance
export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});
// Seed initial data
export async function seedDatabase() {
    try {
        // Check if services exist
        const serviceCount = await prisma.service.count();
        if (serviceCount === 0) {
            await prisma.service.createMany({
                data: [
                    { name: "Wash Shirt", price: 500, category: "Washing" },
                    { name: "Wash Trouser", price: 700, category: "Washing" },
                    { name: "Dry Clean Suit", price: 2500, category: "Dry Cleaning" },
                    { name: "Wash Bedsheet", price: 1200, category: "Washing" },
                    { name: "Wash Curtain", price: 2000, category: "Washing" },
                    { name: "Iron Shirt", price: 200, category: "Ironing" },
                    { name: "Iron Trouser", price: 300, category: "Ironing" },
                ]
            });
            console.log("✓ Services seeded");
        }
        // Check if settings exist
        const settingCount = await prisma.setting.count();
        if (settingCount === 0) {
            await prisma.setting.createMany({
                data: [
                    { key: "shop_name", value: "CleanWave Laundry" },
                    { key: "shop_phone", value: "" },
                    { key: "shop_address", value: "" },
                    { key: "receipt_footer", value: "Thank you! Please bring this receipt when collecting your clothes." },
                    { key: "default_pickup_days", value: "3" },
                    { key: "currency_symbol", value: "₦" },
                ]
            });
            console.log("✓ Settings seeded");
        }
        console.log("✓ Database initialized at:", getDatabasePath());
    }
    catch (error) {
        console.error("Error seeding database:", error);
    }
}
// Graceful shutdown
process.on("beforeExit", async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=prisma.js.map