
# Neon Setup - Own SQL with Automated Backups/Scaling

1. Create project at console.neon.tech -> New Project -> levitate-rebuild, region us-east-1
2. Copy DATABASE_URL (pooled) and DIRECT_URL (direct) into .env
3. Run: npx prisma migrate dev --name init  OR paste neon/schema.sql into SQL Editor
4. Backups: Dashboard -> Backups -> PITR enabled automatically
5. Scaling: Settings -> Autoscaling ON, min 0.25 max 2 CU, scale to zero ON
6. Branching: Branches -> Create branch for testing Vertafore sync
7. Indexes already defined in schema.sql
