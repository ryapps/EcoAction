import pg from 'pg';
import { databaseConfig } from '../lib/db-config.mjs';

const id = process.env.DEMO_USER_ID;
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '')) throw new Error('DEMO_USER_ID harus UUID');
const client = new pg.Client(databaseConfig('MIGRATION_DATABASE_URL'));
try {
  await client.connect();
  await client.query('BEGIN');
  await client.query("INSERT INTO public.users (id, name, email) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [id, 'Pelajar Demo', 'demo@ecoaction.example']);
  const result = await client.query('SELECT id FROM public.users WHERE id = $1 AND email = $2 AND name = $3', [id, 'demo@ecoaction.example', 'Pelajar Demo']);
  if (result.rowCount !== 1) throw new Error('Seed identity conflict');
  await client.query('COMMIT');
  console.log('Demo user ready (idempotent seed).');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('Seed failed:', error.code || 'IDENTITY_OR_CONFIG_ERROR');
  process.exitCode = 1;
} finally { await client.end(); }
