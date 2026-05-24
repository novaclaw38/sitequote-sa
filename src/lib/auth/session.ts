import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "sitequote_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionPayload = {
  contractorId: string;
  email: string;
};

function getSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ?? "dev-only-change-in-production-min-32-chars!!";
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.contractorId === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        contractorId: payload.contractorId,
        email: payload.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}
