
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error","warn"] : ["error"]
});

const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// ---- API ----
// health check for Railway / Render
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "plain-sunset", time: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// list contacts
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      take: 100,
      orderBy: { updatedAt: "desc" },
      include: { tags: { include: { tag: true } }, keyFacts: true }
    });
    res.json(contacts);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// overdue - keep in touch
app.get("/api/contacts/overdue", async (req, res) => {
  try {
    const ownerId = req.query.ownerId as string;
    if (!ownerId) return res.status(400).json({ error: "ownerId required" });
    // uses your db.ts raw query logic
    const overdue = await prisma.$queryRaw`
      SELECT * FROM "Contact"
      WHERE "ownerId" = ${ownerId}
      AND "lastContacted" < NOW() - ("keepInterval" || ' days')::interval
      ORDER BY "lastContacted" ASC
    `;
    res.json(overdue);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// create contact
app.post("/api/contacts", async (req, res) => {
  try {
    const data = req.body;
    const contact = await prisma.contact.create({ data });
    res.json(contact);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Serve Vite build ----
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// SPA fallback
app.get("/{*any}", (req, res) => {
  // don't intercept /api
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "not found" });
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`> Levitate ready on http://localhost:${PORT}`);
  console.log(`> Health: /api/health`);
});
