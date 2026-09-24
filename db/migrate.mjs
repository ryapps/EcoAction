import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import pg from 'pg';
import { databaseConfig } from '../lib/db-config.mjs';

const client = new pg.Client(databaseConfig('MIGRATION_DATABASE_URL'));
try {
  await client.connect();
  await client.query('BEGIN');
  await client.query("SELECT pg_advisory_xact_lock(71620341)");
  await client.query('CREATE TABLE IF NOT EXISTS public.ecoaction_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
  await client.query('ALTER TABLE public.ecoaction_migrations ENABLE ROW LEVEL SECURITY');
  await client.query('REVOKE ALL ON public.ecoaction_migrations FROM anon, authenticated');
  const directory = new URL('./migrations/', import.meta.url);
  for (const name of (await readdir(directory)).filter(name => name.endsWith('.sql')).sort()) {
    const sql = (await readFile(new URL(name, directory), 'utf8')).replace(/\r\n/g, '\n');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const existing = await client.query('SELECT checksum FROM public.ecoaction_migrations WHERE name = $1', [name]);
    if (existing.rowCount) {
      if (existing.rows[0].checksum !== checksum) throw new Error('Migration checksum changed');
      console.log('Already applied: ' + name);
      continue;
    }
    await client.query(sql);
    await client.query('INSERT INTO public.ecoaction_migrations (name, checksum) VALUES ($1, $2)', [name, checksum]);
    console.log('Applied: ' + name);
  }
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('Migration failed:', error.code || 'CONFIG_OR_SCHEMA_ERROR');
  process.exitCode = 1;
} finally { await client.end(); }
