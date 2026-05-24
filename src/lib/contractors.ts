import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { getDb, hasDatabase, schema } from "@/lib/db";
import { fileStore } from "@/lib/db/file-store";
import type { ContractorRow } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type ContractorPublic = {
  id: string;
  email: string;
  companyName: string;
  phone: string | null;
  labourRateZar: number;
  markupPercent: number;
};

function toPublic(c: ContractorRow): ContractorPublic {
  return {
    id: c.id,
    email: c.email,
    companyName: c.companyName,
    phone: c.phone,
    labourRateZar: c.labourRateZar,
    markupPercent: c.markupPercent,
  };
}

export async function registerContractor(input: {
  email: string;
  password: string;
  companyName: string;
  phone?: string;
}): Promise<ContractorPublic> {
  const existing = await getContractorByEmail(input.email);
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const id = uuidv4();
  const passwordHash = await hashPassword(input.password);
  const row: ContractorRow & { passwordHash: string } = {
    id,
    email: input.email.toLowerCase(),
    passwordHash,
    companyName: input.companyName,
    phone: input.phone ?? null,
    labourRateZar: 350,
    markupPercent: 15,
    createdAt: new Date(),
  };

  if (hasDatabase()) {
    const db = getDb();
    await db.insert(schema.contractors).values({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      companyName: row.companyName,
      phone: row.phone,
      labourRateZar: row.labourRateZar,
      markupPercent: row.markupPercent,
    });
  } else {
    await fileStore.createContractor(row);
  }

  return toPublic(row);
}

export async function loginContractor(
  email: string,
  password: string,
): Promise<ContractorPublic> {
  const contractor = await getContractorByEmail(email);
  if (!contractor) throw new Error("Invalid email or password");

  const hash =
    "passwordHash" in contractor
      ? (contractor as { passwordHash: string }).passwordHash
      : "";

  const valid = await verifyPassword(password, hash);
  if (!valid) throw new Error("Invalid email or password");

  return toPublic(contractor as ContractorRow);
}

export async function getContractorById(
  id: string,
): Promise<ContractorPublic | null> {
  const c = await getContractorRow(id);
  return c ? toPublic(c) : null;
}

async function getContractorRow(
  id: string,
): Promise<(ContractorRow & { passwordHash?: string }) | null> {
  if (hasDatabase()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.contractors)
      .where(eq(schema.contractors.id, id))
      .limit(1);
    return rows[0] ?? null;
  }
  return fileStore.getContractor(id);
}

async function getContractorByEmail(
  email: string,
): Promise<(ContractorRow & { passwordHash: string }) | null> {
  if (hasDatabase()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.contractors)
      .where(eq(schema.contractors.email, email.toLowerCase()))
      .limit(1);
    return (rows[0] as ContractorRow & { passwordHash: string }) ?? null;
  }
  return fileStore.getContractorByEmail(email);
}

export async function updateContractorSettings(
  id: string,
  patch: Partial<{
    companyName: string;
    phone: string | null;
    labourRateZar: number;
    markupPercent: number;
  }>,
): Promise<ContractorPublic | null> {
  if (hasDatabase()) {
    const db = getDb();
    await db
      .update(schema.contractors)
      .set(patch)
      .where(eq(schema.contractors.id, id));
  } else {
    await fileStore.updateContractor(id, patch);
  }
  return getContractorById(id);
}
