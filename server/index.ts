import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter, log: ["error"] });
const PORT = Number(process.env.PORT) || 3000;
app.use(cors());
app.use(express.json());
app.get("/api/health", async (req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ ok: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});
const distPath = path.join(__dirname, "../../dist");
app.use(express.static(distPath));
app.get("/{*any}", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "not found" });
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(PORT, "0.0.0.0", () => console.log(`> Levitate ready on http://localhost:${PORT}`));
