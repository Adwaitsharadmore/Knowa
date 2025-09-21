// lib/slack-verify.ts
import crypto from "crypto";

export function verifySlackSignature({
  signingSecret,
  body,
  timestamp,
  signature,
}: {
  signingSecret: string;
  body: string;
  timestamp: string | null;
  signature: string | null;
}) {
  if (!timestamp || !signature) return false;

  // reject old requests (>5m)
  const ts = Number(timestamp);
  if (!ts || Math.abs(Date.now() / 1000 - ts) > 60 * 5) return false;

  const sigBase = `v0:${timestamp}:${body}`;
  const mySig = `v0=${crypto
    .createHmac("sha256", signingSecret)
    .update(sigBase, "utf8")
    .digest("hex")}`;

  try {
    return crypto.timingSafeEqual(Buffer.from(mySig), Buffer.from(signature));
  } catch {
    return false;
  }
}
