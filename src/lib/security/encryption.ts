// src/lib/security/encryption.ts
import * as crypto from "crypto"; // or: import crypto from "crypto" (if esModuleInterop)

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;      // 96-bit nonce for GCM
const TAG_LENGTH = 16;     // 128-bit auth tag
const KEY_LENGTH = 32;     // 256-bit key

function getKey(): Buffer {
  const b64 = process.env.ENCRYPTION_KEY;
  if (!b64) throw new Error("ENCRYPTION_KEY environment variable is required");
  const key = Buffer.from(b64, "base64");
  if (key.length !== KEY_LENGTH) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes (base64-encoded)");
  }
  return key;
}

/**
 * Returns a compact base64 blob: [iv(12) | tag(16) | ciphertext]
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decrypt(blob: string): string {
  const key = getKey();
  const buf = Buffer.from(blob, "base64");

  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}
