
# Levitate Hosting Kit - plain-sunset

You already fixed Neon. Now add a server so Railway/Render/Fly can host it.

## 1. Copy files to your project
Copy:
- server/index.ts -> C:\Users\adame\Downloads\levitate-rebuild-github\server\index.ts
- tsconfig.server.json -> project root

## 2. Install deps
```powershell
npm install express cors dotenv --legacy-peer-deps
npm install -D @types/express @types/cors tsx --legacy-peer-deps
```

## 3. Update package.json scripts
Replace scripts with:
```json
{
  "scripts": {
    "dev": "vite",
    "dev:server": "tsx watch server/index.ts",
    "build": "vite build && tsc -p tsconfig.server.json",
    "start": "node dist-server/server/index.js",
    "db:status": "prisma migrate status",
    "db:generate": "prisma generate"
  }
}
```

## 4. Test locally
```powershell
npm run build
npm start
# open http://localhost:3000
# check http://localhost:3000/api/health -> should say db: plain-sunset
```

## 5. Deploy

### Railway (recommended)
- railway.app -> New Project -> Deploy from GitHub -> select levitate-rebuild-github
- Variables -> add:
  DATABASE_URL=postgresql://neondb_owner:npg_N7MEmUlQkz1w@ep-plain-sunset-awycooyr.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  DIRECT_URL=same as above
  VITE_CLERK_PUBLISHABLE_KEY=... (from Clerk dashboard)
  CLERK_SECRET_KEY=...
- Settings -> Root directory = /
- Deploy. It runs `npm run build` then `npm start`

### Render
- render.com -> New Web Service -> connect repo
- Build command: npm install --legacy-peer-deps && npm run build
- Start command: npm start
- Add same env vars

### Vercel (frontend only, needs serverless functions)
Vercel can still work but you'll need to move server/index.ts to api/ folder. Use Railway for full CRM.

## Notes
- Prisma 7.9.0 works, don't downgrade
- .env is gitignored, but Railway needs it in dashboard
- Health endpoint verifies Neon connection
