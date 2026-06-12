import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
import { env } from '../../config/env.js';

const ALGORITHM = 'aes-256-gcm' as const;
const KEY = Buffer.from(env.ENCRYPTION_KEY, 'hex');

/**
 * Cifra PII con AES-256-GCM.
 * Formato de salida: iv:authTag:ciphertext (hex, separado por ':')
 */
export function encrypt(plaintext: string): string;
export function encrypt(plaintext: null | undefined): null;
export function encrypt(plaintext: string | null | undefined): string | null {
  if (!plaintext) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Descifra datos protegidos con AES-256-GCM.
 */
export function decrypt(ciphertext: string): string;
export function decrypt(ciphertext: null | undefined): null;
export function decrypt(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':') as [string, string, string];
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

/** SHA-256 de un string (para API keys y validación de tokens). */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/** Token criptográfico seguro de 256 bits (para API keys de zonas). */
export function generateApiKey(): string {
  return `btk_${randomBytes(24).toString('hex')}`;
}
