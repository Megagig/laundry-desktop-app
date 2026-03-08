import { PrismaClient } from "@prisma/client";
export declare const prisma: PrismaClient<{
    datasources: {
        db: {
            url: string;
        };
    };
    log: ("query" | "warn" | "error")[];
}, "query" | "warn" | "error", import(".prisma/client/runtime/client").DefaultArgs>;
export declare function seedDatabase(): Promise<void>;
//# sourceMappingURL=prisma.d.ts.map