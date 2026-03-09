import { PrismaClient } from "@prisma/client";
export declare const prisma: PrismaClient<{
    log: ("query" | "warn" | "error")[];
}, never, import(".prisma/client/runtime/library").DefaultArgs>;
export declare function seedDatabase(): Promise<void>;
//# sourceMappingURL=prisma.d.ts.map