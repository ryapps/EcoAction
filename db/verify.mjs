import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { databaseConfig } from '../lib/db-config.mjs';

const client = new pg.Client(databaseConfig());
try {
  await client.connect();
  const demo = await client.query('SELECT count(*)::int AS count FROM public.users WHERE id = $1 AND email = $2', [process.env.DEMO_USER_ID, 'demo@ecoaction.example']);
  assert.equal(demo.rows[0].count, 1);
  await client.query('BEGIN');
  const user = randomUUID();
  await client.query('INSERT INTO public.users(id, name, email) VALUES ($1, $2, $3)', [user, 'Fixture', user + '@example.invalid']);
  const insert = 'INSERT INTO public.actions(user_id, title, category, status, action_date) VALUES ($1, $2, $3, $4, $5) RETURNING id';
  const params = [user, 'Matikan lampu yang tidak digunakan', 'energy', 'todo', '2026-09-24'];
  const action = await client.query(insert, params);
  await client.query('UPDATE public.actions SET status = $1 WHERE id = $2 AND user_id = $3', ['completed', action.rows[0].id, user]);
  const stored = await client.query('SELECT status FROM public.actions WHERE id = $1 AND user_id = $2', [action.rows[0].id, user]);
  assert.equal(stored.rows[0].status, 'completed');
  for (const [values, code] of [
    [params, '23505'],
    [[user, 'Kategori salah', 'invalid', 'todo', '2026-09-24'], '23514'],
    [[user, 'Status salah', 'energy', 'invalid', '2026-09-24'], '23514'],
    [[user, ' ', 'energy', 'todo', '2026-09-24'], '23514'],
    [[user, ' Ada spasi ', 'energy', 'todo', '2026-09-24'], '23514'],
    [[randomUUID(), 'Owner hilang', 'energy', 'todo', '2026-09-24'], '23503'],
  ]) {
    await client.query('SAVEPOINT invalid_fixture');
    await assert.rejects(client.query(insert, values), error => error.code === code);
    await client.query('ROLLBACK TO SAVEPOINT invalid_fixture');
  }
  const security = await client.query("SELECT relname, relrowsecurity FROM pg_class WHERE oid IN ('public.users'::regclass, 'public.actions'::regclass)");
  assert.equal(security.rows.length, 2);
  assert.ok(security.rows.every(row => row.relrowsecurity));
  await client.query('SET LOCAL ROLE anon');
  await client.query('SAVEPOINT anon_fixture');
  await assert.rejects(client.query('SELECT * FROM public.actions'), error => error.code === '42501');
  await client.query('ROLLBACK TO SAVEPOINT anon_fixture');
  await client.query('RESET ROLE');
  await client.query('ROLLBACK');
  const cleanup = await client.query('SELECT id FROM public.users WHERE id = $1', [user]);
  assert.equal(cleanup.rowCount, 0);
  console.log('PASS: single demo user, SQL read/write, uniqueness, allowlists, title checks, FK, RLS, anon access denied, fixture rollback.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('Verification failed:', error.code || error.name);
  process.exitCode = 1;
} finally { await client.end(); }
