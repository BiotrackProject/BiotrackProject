import { ManagementClient } from 'auth0';
import { env } from './env.js';

// Cliente de Management API de Auth0 (operaciones admin: crear/bloquear/desbloquear usuarios)
export const auth0Management = new ManagementClient({
  domain: env.AUTH0_DOMAIN,
  clientId: env.AUTH0_MGMT_CLIENT_ID,
  clientSecret: env.AUTH0_MGMT_CLIENT_SECRET,
});
