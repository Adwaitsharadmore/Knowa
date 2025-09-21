// lib/crypto/secrets.ts
import crypto from "crypto";

const KEY_HEX = process.env.SECRETS_KEY || ""; // 64 hex chars (32 bytes)
if (KEY_HEX.length !== 64) {
  throw new Error("SECRETS_KEY must be 64 hex chars (32 bytes for AES-256-GCM)");
}
const KEY = Buffer.from(KEY_HEX, "hex");

// Returns base64: iv(12b) | ciphertext | tag(16b)
export function sealSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, ct, tag]).toString("base64");
}

export function openSecret(cipherB64: string): string {
  const buf = Buffer.from(cipherB64, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(buf.length - 16);
  const ct = buf.subarray(12, buf.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}
