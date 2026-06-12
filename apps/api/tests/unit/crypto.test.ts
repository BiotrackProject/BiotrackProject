import { describe, it, expect } from '@jest/globals';
import { encrypt, decrypt, sha256, generateApiKey } from '../../src/shared/utils/crypto.js';

describe('encrypt / decrypt', () => {
  it('encrypts and correctly decrypts a plaintext string', () => {
    const original = 'contacto@denunciante.do';
    const ciphertext = encrypt(original);
    expect(ciphertext).not.toBe(original);
    expect(decrypt(ciphertext)).toBe(original);
  });

  it('produces unique ciphertexts for the same plaintext (random IV)', () => {
    const ct1 = encrypt('mismo dato');
    const ct2 = encrypt('mismo dato');
    expect(ct1).not.toBe(ct2);
    expect(decrypt(ct1)).toBe('mismo dato');
    expect(decrypt(ct2)).toBe('mismo dato');
  });

  it('output format is iv:authTag:ciphertext separated by colons', () => {
    const ct = encrypt('test');
    const parts = ct.split(':');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toMatch(/^[0-9a-f]+$/);
    expect(parts[1]).toMatch(/^[0-9a-f]+$/);
    expect(parts[2]).toMatch(/^[0-9a-f]+$/);
  });

  it('returns null when encrypting null', () => {
    expect(encrypt(null)).toBeNull();
  });

  it('returns null when encrypting undefined', () => {
    expect(encrypt(undefined)).toBeNull();
  });

  it('returns null when decrypting null', () => {
    expect(decrypt(null)).toBeNull();
  });

  it('returns null when decrypting undefined', () => {
    expect(decrypt(undefined)).toBeNull();
  });

  it('handles special characters and unicode in plaintext', () => {
    const text = 'María Ñoño — +18091234567 📍';
    expect(decrypt(encrypt(text))).toBe(text);
  });
});

describe('sha256', () => {
  it('produces a 64-character hex string', () => {
    expect(sha256('biotrack')).toHaveLength(64);
  });

  it('is deterministic for the same input', () => {
    expect(sha256('biotrack')).toBe(sha256('biotrack'));
  });

  it('produces different hashes for different inputs', () => {
    expect(sha256('input-a')).not.toBe(sha256('input-b'));
  });
});

describe('generateApiKey', () => {
  it('starts with the btk_ prefix', () => {
    expect(generateApiKey()).toMatch(/^btk_/);
  });

  it('generates unique keys on successive calls', () => {
    const keys = new Set(Array.from({ length: 10 }, () => generateApiKey()));
    expect(keys.size).toBe(10);
  });

  it('has the expected total length (btk_ + 48 hex chars)', () => {
    expect(generateApiKey()).toHaveLength(4 + 48);
  });
});
