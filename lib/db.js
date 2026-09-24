import 'server-only';
import pg from 'pg';
import { databaseConfig } from './db-config.mjs';

let pool;
export function getPool() {
  if (!pool) {
    pool = new pg.Pool(databaseConfig());
    pool.on('error', () => console.error('Database connection unavailable'));
  }
  return pool;
}
