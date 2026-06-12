// Env vars must be set before any module that imports env.ts is loaded.
// Jest runs setupFiles before loading test modules, so this is safe.
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3001';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/testdb';
process.env['AUTH0_DOMAIN'] = 'test.auth0.com';
process.env['AUTH0_AUDIENCE'] = 'https://biotrack.api.test';
process.env['AUTH0_MGMT_CLIENT_ID'] = 'ci_mgmt_client_id';
process.env['AUTH0_MGMT_CLIENT_SECRET'] = 'ci_mgmt_client_secret';
process.env['ENCRYPTION_KEY'] = 'a'.repeat(64);
process.env['EMAIL_FROM'] = 'no-reply@biotrack.test';
process.env['FRONTEND_URL'] = 'http://localhost:5173';
