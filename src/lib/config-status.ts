import { hasDatabase } from "@/lib/db";
import { hasSupplierSearch } from "@/lib/suppliers/search";

export type ConfigStatus = {
  database: boolean;
  openai: boolean;
  serper: boolean;
  resend: boolean;
  auth: boolean;
  ready: boolean;
  missing: string[];
};

export function getConfigStatus(): ConfigStatus {
  const database = hasDatabase();
  const openai = Boolean(process.env.OPENAI_API_KEY);
  const serper = hasSupplierSearch();
  const resend = Boolean(process.env.RESEND_API_KEY);
  const auth = Boolean(process.env.AUTH_SECRET);

  const missing: string[] = [];
  if (!database) missing.push("DATABASE_URL");
  if (!openai) missing.push("OPENAI_API_KEY");
  if (!serper) missing.push("SERPER_API_KEY");
  if (!auth) missing.push("AUTH_SECRET");

  return {
    database,
    openai,
    serper,
    resend,
    auth,
    ready: database && openai && auth,
    missing,
  };
}
