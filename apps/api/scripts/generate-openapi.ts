import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { swaggerSpec } from '../src/config/swagger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '..', 'openapi.json');

writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), 'utf-8');
console.log(`OpenAPI spec generado en: ${outputPath}`);
console.log('Puedes importar este archivo en OWASP ZAP como API Definition.');
