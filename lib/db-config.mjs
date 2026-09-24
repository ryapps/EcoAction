import { readFileSync } from 'node:fs';
import path from 'node:path';

export function databaseConfig(variable = 'DATABASE_URL') {
  const value = process.env[variable];
  if (!value) throw new Error(variable + ' belum diisi');
  const url = new URL(value);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Connection string PostgreSQL tidak valid');
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(key);
  return {
    connectionString: url.toString(),
    ssl: { ca: readFileSync(path.join(process.cwd(), 'prod-ca-2021.crt'), 'utf8'), rejectUnauthorized: true },
    max: 1,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
    statement_timeout: 10000,
  };
}
