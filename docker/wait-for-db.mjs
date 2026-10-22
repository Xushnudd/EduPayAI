import pg from 'pg';

const timeout = Number(process.env.DB_WAIT_TIMEOUT_MS ?? 60000);
if (!Number.isInteger(timeout) || timeout < 1 || timeout > 60000 || !process.env.DATABASE_URL) {
  console.error('Database startup configuration is invalid.');
  process.exit(1);
}
try {
  const url = new URL(process.env.DATABASE_URL);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.pathname.length < 2) throw new Error();
} catch {
  console.error('DATABASE_URL must be a PostgreSQL URL.');
  process.exit(1);
}

// A process-level deadline also bounds DNS, driver cleanup and retry delays.
const deadline = setTimeout(() => {
  console.error('Database readiness deadline exceeded.');
  process.exit(1);
}, timeout);
let ready = false;
console.log('Waiting for database readiness...');
while (!ready) {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: Math.min(2000, timeout),
    query_timeout: Math.min(2000, timeout),
  });
  // Connection failures never print URLs, passwords or raw driver errors.
  client.on('error', () => {});
  try {
    await client.connect();
    await client.query('SELECT 1');
    ready = true;
  } catch {
    // Retry readiness only; migration errors are handled once by the entrypoint.
  } finally {
    await client.end().catch(() => {});
  }
  if (!ready) await new Promise(resolve => setTimeout(resolve, 500));
}
clearTimeout(deadline);
console.log('Database is ready.');
