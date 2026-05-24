import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { ContractorRow } from "./schema";
import type { Quote } from "@/lib/quote-schema";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "sitequote.json");

type FileData = {
  contractors: Record<string, ContractorRow & { passwordHash: string }>;
  quotes: Record<
    string,
    {
      id: string;
      contractorId: string | null;
      shareToken: string;
      data: Quote;
      status: string;
      createdAt: string;
      updatedAt: string;
    }
  >;
  priceListItems: Record<
    string,
    {
      id: string;
      contractorId: string;
      description: string;
      unit: string;
      unitPriceZar: number;
      searchQuery: string | null;
      createdAt: string;
    }
  >;
};

async function load(): Promise<FileData> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as FileData;
  } catch {
    return { contractors: {}, quotes: {}, priceListItems: {} };
  }
}

async function save(data: FileData): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export const fileStore = {
  async getContractor(id: string) {
    const data = await load();
    return data.contractors[id] ?? null;
  },

  async getContractorByEmail(email: string) {
    const data = await load();
    return (
      Object.values(data.contractors).find(
        (c) => c.email.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  },

  async createContractor(
    contractor: ContractorRow & { passwordHash: string },
  ) {
    const data = await load();
    data.contractors[contractor.id] = contractor;
    await save(data);
    return contractor;
  },

  async updateContractor(
    id: string,
    patch: Partial<ContractorRow & { passwordHash: string }>,
  ) {
    const data = await load();
    const existing = data.contractors[id];
    if (!existing) return null;
    data.contractors[id] = { ...existing, ...patch };
    await save(data);
    return data.contractors[id];
  },

  async saveQuote(row: {
    id: string;
    contractorId: string | null;
    shareToken: string;
    data: Quote;
    status: string;
    createdAt: string;
    updatedAt: string;
  }) {
    const data = await load();
    data.quotes[row.id] = row;
    await save(data);
  },

  async getQuote(id: string) {
    const data = await load();
    return data.quotes[id] ?? null;
  },

  async getQuoteByShareToken(token: string) {
    const data = await load();
    return (
      Object.values(data.quotes).find((q) => q.shareToken === token) ?? null
    );
  },

  async listQuotes(contractorId?: string | null) {
    const data = await load();
    let rows = Object.values(data.quotes);
    if (contractorId) {
      rows = rows.filter((q) => q.contractorId === contractorId);
    } else {
      rows = rows.filter((q) => q.contractorId === null);
    }
    return rows.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async listPriceListItems(contractorId: string) {
    const data = await load();
    return Object.values(data.priceListItems)
      .filter((i) => i.contractorId === contractorId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  },

  async addPriceListItem(item: FileData["priceListItems"][string]) {
    const data = await load();
    data.priceListItems[item.id] = item;
    await save(data);
    return item;
  },

  async deletePriceListItem(id: string, contractorId: string) {
    const data = await load();
    const item = data.priceListItems[id];
    if (!item || item.contractorId !== contractorId) return false;
    delete data.priceListItems[id];
    await save(data);
    return true;
  },
};
