
# Execution Plan - Token-Safe

Goal: No more full rewrites that burn tokens and lose saves. Every step patches `src/App.tsx` or adds a small new file.

## Phase 0 - Done
- Versioned artifact saved as `levitate-rebuild_agentic_artifact_1_7d9aa1c6c647.html`
- Source extracted to `src/App.tsx`

## Phase 1 - Layout
- 1.1 DONE: sidebar 280px, max-w 1440, p-6 cards, 2-col dashboard, drawer z-index
- 1.2 TODO: tables `overflow-x-auto`, kanban `min-w-[300px] snap`, reduce dense text, tab filters

Prompt for 1.2 (copy/paste):
> Edit artifact container:///mnt/data/levitate-rebuild_agentic_artifact_1_7d9aa1c6c647.html ... fix only tables overflow ...

## Phase 2 - Backend
- 2.1 supabase/schema.sql - create tables listed in README, enable RLS
- 2.2 supabase client + AuthContext
- 2.3 swap localStorage to Supabase with optimistic updates
- 2.4 Gmail OAuth: Supabase Auth google provider, `gmail.users.messages.send`, store threadId, webhook via Supabase Edge Function

## Phase 3 - Cards
- Adapter pattern: `src/lib/cards.ts` interface { createCard() } -> implement LobMock + CsvExport
- Queue UI

## Phase 4 - Integrations
- Generic sync adapter: `src/lib/sync.ts`
- Mocks: Vertafore returns renewal, policy status; Redtail returns birthdays/anniversaries/relationships
- UI in Settings already wired, just connect toggles

Token budget per step: <800 tokens prompt, <150 lines diff.
