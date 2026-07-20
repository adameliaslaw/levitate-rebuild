
-- Neon Postgres schema for Levitate Rebuild v2.1
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Contact" (
  id TEXT PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  "ownerId" TEXT NOT NULL REFERENCES "User"(id),
  "lastContacted" TIMESTAMPTZ,
  "keepInterval" INT DEFAULT 30,
  birthday TIMESTAMPTZ,
  renewal TIMESTAMPTZ,
  color TEXT,
  connections INT DEFAULT 0,
  happiness INT DEFAULT 5,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_owner ON "Contact"("ownerId");
CREATE INDEX IF NOT EXISTS idx_contact_lastcontacted ON "Contact"("lastContacted");
CREATE INDEX IF NOT EXISTS idx_contact_renewal ON "Contact"(renewal);
CREATE INDEX IF NOT EXISTS idx_contact_email ON "Contact"(email);
CREATE INDEX IF NOT EXISTS idx_contact_company ON "Contact"(company);
CREATE INDEX IF NOT EXISTS idx_contact_owner_last ON "Contact"("ownerId", "lastContacted");

CREATE TABLE IF NOT EXISTS "Tag" (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS "ContactTag" (
  "contactId" TEXT REFERENCES "Contact"(id) ON DELETE CASCADE,
  "tagId" TEXT REFERENCES "Tag"(id) ON DELETE CASCADE,
  "assignedAt" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("contactId","tagId")
);
CREATE INDEX IF NOT EXISTS idx_contacttag_tag ON "ContactTag"("tagId");

CREATE TABLE IF NOT EXISTS "KeyFact" (
  id TEXT PRIMARY KEY,
  "contactId" TEXT REFERENCES "Contact"(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_keyfact_contact ON "KeyFact"("contactId");

CREATE TABLE IF NOT EXISTS "Note" (
  id TEXT PRIMARY KEY,
  "contactId" TEXT REFERENCES "Contact"(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  "authorId" TEXT REFERENCES "User"(id),
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_note_contact ON "Note"("contactId");

CREATE TABLE IF NOT EXISTS "ActionItem" (
  id TEXT PRIMARY KEY,
  "contactId" TEXT REFERENCES "Contact"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due TIMESTAMPTZ,
  "assigneeId" TEXT REFERENCES "User"(id),
  "isPrivate" BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_action_contact ON "ActionItem"("contactId");
CREATE INDEX IF NOT EXISTS idx_action_due ON "ActionItem"(due);

CREATE TABLE IF NOT EXISTS "Template" (
  id TEXT PRIMARY KEY,
  "ownerId" TEXT REFERENCES "User"(id),
  title TEXT NOT NULL,
  category TEXT,
  subject TEXT,
  body TEXT,
  social TEXT,
  gradient TEXT,
  icon TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Campaign" (
  id TEXT PRIMARY KEY,
  "ownerId" TEXT REFERENCES "User"(id),
  "templateId" TEXT REFERENCES "Template"(id),
  name TEXT,
  "recipientsTag" TEXT,
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'draft',
  "scheduledAt" TIMESTAMPTZ,
  "sentAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Send" (
  id TEXT PRIMARY KEY,
  "campaignId" TEXT REFERENCES "Campaign"(id),
  "contactId" TEXT REFERENCES "Contact"(id),
  status TEXT DEFAULT 'queued',
  "gmailThreadId" TEXT,
  "gmailMessageId" TEXT,
  "openedAt" TIMESTAMPTZ,
  "repliedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_send_campaign ON "Send"("campaignId");
CREATE INDEX IF NOT EXISTS idx_send_contact ON "Send"("contactId");

CREATE TABLE IF NOT EXISTS "Automation" (
  id TEXT PRIMARY KEY,
  "ownerId" TEXT REFERENCES "User"(id),
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  "triggerDetail" TEXT,
  active BOOLEAN DEFAULT TRUE,
  "enrolledCount" INT DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "AutomationStep" (
  id TEXT PRIMARY KEY,
  "automationId" TEXT REFERENCES "Automation"(id) ON DELETE CASCADE,
  "order" INT NOT NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  delay TEXT,
  "templateId" TEXT
);

CREATE TABLE IF NOT EXISTS "Enrollment" (
  id TEXT PRIMARY KEY,
  "automationId" TEXT REFERENCES "Automation"(id) ON DELETE CASCADE,
  "contactId" TEXT,
  "currentStep" INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Integration" (
  id TEXT PRIMARY KEY,
  "ownerId" TEXT REFERENCES "User"(id),
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'disconnected',
  "lastSyncAt" TIMESTAMPTZ,
  config JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("ownerId", provider)
);

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW."updatedAt" = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_contact_updated ON "Contact";
CREATE TRIGGER trg_contact_updated BEFORE UPDATE ON "Contact" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
