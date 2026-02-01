import { encodeHex } from "@std/encoding/hex";
import { encodeBase64 } from "@std/encoding/base64";

const SESSION_SECRET = Deno.env.get("SESSION_SECRET") || "change-this-secret";
const ENCODER = new TextEncoder();

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  expiresAt: number;
}

export async function createSessionToken(data: SessionData): Promise<string> {
  const payload = JSON.stringify(data);
  const key = await crypto.subtle.importKey(
    "raw",
    ENCODER.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    ENCODER.encode(payload),
  );

  const token = {
    payload,
    signature: encodeHex(new Uint8Array(signature)),
  };

  return encodeBase64(ENCODER.encode(JSON.stringify(token)));
}

export async function verifySessionToken(
  token: string,
): Promise<SessionData | null> {
  try {
    const decoded = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(token), (c) => c.charCodeAt(0)),
      ),
    );

    const key = await crypto.subtle.importKey(
      "raw",
      ENCODER.encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const signatureBytes = new Uint8Array(
      decoded.signature.match(/.{1,2}/g).map((byte: string) =>
        parseInt(byte, 16)
      ),
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      ENCODER.encode(decoded.payload),
    );

    if (!isValid) {
      return null;
    }

    const sessionData: SessionData = JSON.parse(decoded.payload);

    // Check if session has expired
    if (Date.now() > sessionData.expiresAt) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error("Error verifying session token:", error);
    return null;
  }
}

export function createSessionExpiry(daysFromNow = 7): number {
  return Date.now() + daysFromNow * 24 * 60 * 60 * 1000;
}
