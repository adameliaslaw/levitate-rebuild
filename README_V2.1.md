
## v2.1 - Neon Owned SQL

This version adds backend you own with automated ops.

- `prisma/schema.prisma` - full data model with indexes
- `neon/schema.sql` - direct SQL for Neon console
- `src/lib/db.ts` - Prisma client singleton
- `src/lib/neon.ts` - serverless driver for edge functions
- `.env.example` - DATABASE_URL + DIRECT_URL + Clerk keys

Quick start backend:
```
npm install
npx prisma migrate dev --name init
# or paste neon/schema.sql in Neon SQL Editor
```
