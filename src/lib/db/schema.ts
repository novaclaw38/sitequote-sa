import {
  jsonb,
  pgTable,
  text,
  timestamp,
  real,
} from "drizzle-orm/pg-core";

export const contractors = pgTable("contractors", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  companyName: text("company_name").notNull(),
  phone: text("phone"),
  labourRateZar: real("labour_rate_zar").notNull().default(350),
  markupPercent: real("markup_percent").notNull().default(15),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: text("id").primaryKey(),
  contractorId: text("contractor_id").references(() => contractors.id),
  shareToken: text("share_token").notNull().unique(),
  data: jsonb("data").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const priceListItems = pgTable("price_list_items", {
  id: text("id").primaryKey(),
  contractorId: text("contractor_id")
    .notNull()
    .references(() => contractors.id),
  description: text("description").notNull(),
  unit: text("unit").notNull().default("each"),
  unitPriceZar: real("unit_price_zar").notNull(),
  searchQuery: text("search_query"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ContractorRow = typeof contractors.$inferSelect;
export type QuoteRow = typeof quotes.$inferSelect;
