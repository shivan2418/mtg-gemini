-- Enable the pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add a GIN index using trigrams for fast fuzzy search on card names
-- Note: Removing CONCURRENTLY since Prisma runs migrations in transactions
CREATE INDEX IF NOT EXISTS "Card_name_trgm_idx" ON "Card" USING GIN (name gin_trgm_ops);