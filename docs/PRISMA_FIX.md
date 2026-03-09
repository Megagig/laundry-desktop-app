# Prisma Configuration Fix

**Date:** March 8, 2026  
**Issue:** PrismaClientConstructorValidationError - Unknown property datasources  
**Status:** ✅ Fixed

---

## Problem

When running the application with `npm run dev`, the following error occurred:

```
PrismaClientConstructorValidationError: Unknown property datasources provided to PrismaClient constructor.
```

---

## Root Cause

Prisma 7.x has changed how datasource configuration works:

1. **Old Way (Prisma 5/6)**: Datasource URL was defined in `schema.prisma` using `url = env("DATABASE_URL")`
2. **New Way (Prisma 7)**: Datasource URL is defined in `prisma.config.ts` and the schema file only specifies the provider

The application was using a hybrid approach that wasn't compatible with Prisma 7.

---

## Solution

### 1. Updated `prisma/schema.prisma`

**Before:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**After:**
```prisma
datasource db {
  provider = "sqlite"
}
```

### 2. Updated `prisma.config.ts`

Simplified the configuration to use a static path for development:

```typescript
import { defineConfig } from "prisma/config"
import path from "path"

const getDatabasePath = () => {
  return path.join(process.cwd(), "prisma", "laundry.db")
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `file:${getDatabasePath()}`,
  },
})
```

### 3. Updated `electron/database/prisma.ts`

Added environment variable setting before PrismaClient initialization:

```typescript
// Set DATABASE_URL environment variable for Prisma
process.env.DATABASE_URL = `file:${getDatabasePath()}`

// Create Prisma Client instance
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
})
```

### 4. Updated `.env`

Simplified the .env file:

```
DATABASE_URL="file:./prisma/laundry.db"
```

---

## Steps Taken

1. Removed `url` property from datasource in schema.prisma
2. Updated prisma.config.ts with proper datasource configuration
3. Set DATABASE_URL environment variable in prisma.ts before client initialization
4. Regenerated Prisma Client: `npx prisma generate`
5. Rebuilt the application: `npm run build`
6. Tested the application: `npm run dev`

---

## Verification

✅ Prisma Client generates successfully  
✅ TypeScript compilation passes  
✅ Application starts without errors  
✅ Database connection works  
✅ Seeding functions properly

---

## Key Learnings

### Prisma 7 Changes

1. **No URL in Schema**: The datasource URL is no longer in schema.prisma
2. **Config File Required**: Must use prisma.config.ts for datasource configuration
3. **Environment Variables**: Can still use env vars, but they're set programmatically
4. **Migration Path**: Migrations path is also configured in prisma.config.ts

### Best Practices

1. **Development vs Production**: 
   - Development: Use local file path
   - Production: Use app.getPath("userData") for Electron apps

2. **Dynamic Paths**: Set DATABASE_URL environment variable at runtime for Electron apps

3. **Error Handling**: Always check Prisma version compatibility when upgrading

---

## Database Location

- **Development**: `./prisma/laundry.db` (in project root)
- **Production** (future): Will be in Electron's userData directory

---

## Related Files Modified

- `prisma/schema.prisma` - Removed url from datasource
- `prisma.config.ts` - Updated datasource configuration
- `electron/database/prisma.ts` - Added env var setting
- `.env` - Simplified configuration
- `RUN_APP.md` - Created run instructions

---

## Testing Checklist

- [x] Prisma Client generates without errors
- [x] TypeScript compiles successfully
- [x] Electron app starts
- [x] Database connection established
- [x] Services seeded correctly
- [x] Settings seeded correctly
- [x] IPC handlers work
- [x] Frontend loads

---

## Future Considerations

### Production Build

For production, we'll need to:
1. Use `app.getPath("userData")` for database location
2. Handle database migrations on first run
3. Copy database schema to packaged app
4. Test on different operating systems

### Database Backup

Consider implementing:
1. Automatic backups before migrations
2. Export/import functionality
3. Cloud backup integration (optional)

---

## References

- [Prisma 7 Configuration Docs](https://pris.ly/d/config-datasource)
- [Prisma Client Configuration](https://pris.ly/d/prisma7-client-config)
- [Prisma with Electron](https://www.prisma.io/docs/guides/deployment/electron)

---

**Status:** ✅ RESOLVED  
**Application:** Ready to run with `npm run dev`
