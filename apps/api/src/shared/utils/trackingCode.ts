import { randomBytes } from 'node:crypto';
import prisma from '../../config/database.js';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 8;

function generateCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  return Array.from(bytes, (b) => CHARS[b % CHARS.length]).join('');
}

export async function generateUniqueTrackingCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode();
    const existing = await prisma.denuncia.findUnique({
      where: { codigo_seguimiento: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error('No se pudo generar un código de seguimiento único después de 10 intentos.');
}
