import { SignJWT, jwtVerify } from "jose";

/** Edge/Node-safe session token helpers (used by proxy.ts and server code). */
export const SESSION_COOKIE = "lendisk_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET is missing or too short");
  return new TextEncoder().encode(s);
}

export type SessionPayload = { sub: string; login: string };

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return { sub: String(payload.sub), login: String(payload.login) };
  } catch {
    return null;
  }
}
