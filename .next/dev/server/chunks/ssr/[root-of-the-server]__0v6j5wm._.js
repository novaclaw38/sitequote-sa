module.exports = [
"[project]/src/lib/auth/session.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSession",
    ()=>createSession,
    "destroySession",
    ()=>destroySession,
    "getSession",
    ()=>getSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/sign.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/verify.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
;
;
const COOKIE_NAME = "sitequote_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
function getSecret() {
    const secret = process.env.AUTH_SECRET ?? "dev-only-change-in-production-min-32-chars!!";
    return new TextEncoder().encode(secret);
}
async function createSession(payload) {
    const token = await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SignJWT"](payload).setProtectedHeader({
        alg: "HS256"
    }).setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(getSecret());
    const jar = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    jar.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        maxAge: MAX_AGE,
        path: "/"
    });
}
async function destroySession() {
    const jar = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    jar.delete(COOKIE_NAME);
}
async function getSession() {
    const jar = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jwtVerify"])(token, getSecret());
        if (typeof payload.contractorId === "string" && typeof payload.email === "string") {
            return {
                contractorId: payload.contractorId,
                email: payload.email
            };
        }
        return null;
    } catch  {
        return null;
    }
}
}),
"[project]/src/lib/db/schema.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "contractors",
    ()=>contractors,
    "priceListItems",
    ()=>priceListItems,
    "quotes",
    ()=>quotes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/jsonb.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/table.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/text.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/timestamp.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/real.js [app-rsc] (ecmascript)");
;
const contractors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pgTable"])("contractors", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    email: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("email").notNull().unique(),
    passwordHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("password_hash").notNull(),
    companyName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("company_name").notNull(),
    phone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("phone"),
    labourRateZar: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["real"])("labour_rate_zar").notNull().default(350),
    markupPercent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["real"])("markup_percent").notNull().default(15),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["timestamp"])("created_at", {
        withTimezone: true
    }).notNull().defaultNow()
});
const quotes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pgTable"])("quotes", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    contractorId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("contractor_id").references(()=>contractors.id),
    shareToken: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("share_token").notNull().unique(),
    data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsonb"])("data").notNull(),
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("status").notNull().default("draft"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["timestamp"])("created_at", {
        withTimezone: true
    }).notNull().defaultNow(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["timestamp"])("updated_at", {
        withTimezone: true
    }).notNull().defaultNow()
});
const priceListItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pgTable"])("price_list_items", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    contractorId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("contractor_id").notNull().references(()=>contractors.id),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("description").notNull(),
    unit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("unit").notNull().default("each"),
    unitPriceZar: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["real"])("unit_price_zar").notNull(),
    searchQuery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["text"])("search_query"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["timestamp"])("created_at", {
        withTimezone: true
    }).notNull().defaultNow()
});
}),
"[project]/src/lib/db/index.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDb",
    ()=>getDb,
    "hasDatabase",
    ()=>hasDatabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/serverless/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$neon$2d$http$2f$driver$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/neon-http/driver.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/schema.ts [app-rsc] (ecmascript)");
;
;
;
let _db = null;
function hasDatabase() {
    return Boolean(process.env.DATABASE_URL);
}
function getDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }
    if (!_db) {
        const sql = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["neon"])(process.env.DATABASE_URL);
        _db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$neon$2d$http$2f$driver$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["drizzle"])(sql, {
            schema: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
        });
    }
    return _db;
}
;
}),
"[project]/src/lib/db/schema.ts [app-rsc] (ecmascript) <export * as schema>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "schema",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/schema.ts [app-rsc] (ecmascript)");
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[project]/src/lib/db/file-store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fileStore",
    ()=>fileStore
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const DATA_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), ".data");
const DATA_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, "sitequote.json");
async function load() {
    try {
        const raw = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["readFile"])(DATA_FILE, "utf-8");
        return JSON.parse(raw);
    } catch  {
        return {
            contractors: {},
            quotes: {},
            priceListItems: {}
        };
    }
}
async function save(data) {
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["mkdir"])(DATA_DIR, {
        recursive: true
    });
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["writeFile"])(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}
const fileStore = {
    async getContractor (id) {
        const data = await load();
        return data.contractors[id] ?? null;
    },
    async getContractorByEmail (email) {
        const data = await load();
        return Object.values(data.contractors).find((c)=>c.email.toLowerCase() === email.toLowerCase()) ?? null;
    },
    async createContractor (contractor) {
        const data = await load();
        data.contractors[contractor.id] = contractor;
        await save(data);
        return contractor;
    },
    async updateContractor (id, patch) {
        const data = await load();
        const existing = data.contractors[id];
        if (!existing) return null;
        data.contractors[id] = {
            ...existing,
            ...patch
        };
        await save(data);
        return data.contractors[id];
    },
    async saveQuote (row) {
        const data = await load();
        data.quotes[row.id] = row;
        await save(data);
    },
    async getQuote (id) {
        const data = await load();
        return data.quotes[id] ?? null;
    },
    async getQuoteByShareToken (token) {
        const data = await load();
        return Object.values(data.quotes).find((q)=>q.shareToken === token) ?? null;
    },
    async listQuotes (contractorId) {
        const data = await load();
        let rows = Object.values(data.quotes);
        if (contractorId) {
            rows = rows.filter((q)=>q.contractorId === contractorId);
        } else {
            rows = rows.filter((q)=>q.contractorId === null);
        }
        return rows.sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    async listPriceListItems (contractorId) {
        const data = await load();
        return Object.values(data.priceListItems).filter((i)=>i.contractorId === contractorId).sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    async addPriceListItem (item) {
        const data = await load();
        data.priceListItems[item.id] = item;
        await save(data);
        return item;
    },
    async deletePriceListItem (id, contractorId) {
        const data = await load();
        const item = data.priceListItems[id];
        if (!item || item.contractorId !== contractorId) return false;
        delete data.priceListItems[id];
        await save(data);
        return true;
    }
};
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/lib/auth/password.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hashPassword",
    ()=>hashPassword,
    "verifyPassword",
    ()=>verifyPassword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-rsc] (ecmascript)");
;
const ROUNDS = 12;
async function hashPassword(password) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].hash(password, ROUNDS);
}
async function verifyPassword(password, hash) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].compare(password, hash);
}
}),
"[project]/src/lib/contractors.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getContractorById",
    ()=>getContractorById,
    "loginContractor",
    ()=>loginContractor,
    "registerContractor",
    ()=>registerContractor,
    "updateContractorSettings",
    ()=>updateContractorSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [app-rsc] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/expressions/conditions.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__schema$3e$__ = __turbopack_context__.i("[project]/src/lib/db/schema.ts [app-rsc] (ecmascript) <export * as schema>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$file$2d$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/file-store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$password$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/password.ts [app-rsc] (ecmascript)");
;
;
;
;
;
function toPublic(c) {
    return {
        id: c.id,
        email: c.email,
        companyName: c.companyName,
        phone: c.phone,
        labourRateZar: c.labourRateZar,
        markupPercent: c.markupPercent
    };
}
async function registerContractor(input) {
    const existing = await getContractorByEmail(input.email);
    if (existing) {
        throw new Error("An account with this email already exists");
    }
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
    const passwordHash = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$password$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hashPassword"])(input.password);
    const row = {
        id,
        email: input.email.toLowerCase(),
        passwordHash,
        companyName: input.companyName,
        phone: input.phone ?? null,
        labourRateZar: 350,
        markupPercent: 15,
        createdAt: new Date()
    };
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hasDatabase"])()) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDb"])();
        await db.insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__schema$3e$__["schema"].contractors).values({
            id: row.id,
            email: row.email,
            passwordHash: row.passwordHash,
            companyName: row.companyName,
            phone: row.phone,
            labourRateZar: row.labourRateZar,
            markupPercent: row.markupPercent
        });
    } else {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$file$2d$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fileStore"].createContractor(row);
    }
    return toPublic(row);
}
async function loginContractor(email, password) {
    const contractor = await getContractorByEmail(email);
    if (!contractor) throw new Error("Invalid email or password");
    const hash = "passwordHash" in contractor ? contractor.passwordHash : "";
    const valid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$password$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verifyPassword"])(password, hash);
    if (!valid) throw new Error("Invalid email or password");
    return toPublic(contractor);
}
async function getContractorById(id) {
    const c = await getContractorRow(id);
    return c ? toPublic(c) : null;
}
async function getContractorRow(id) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hasDatabase"])()) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDb"])();
        const rows = await db.select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__schema$3e$__["schema"].contractors).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__schema$3e$__["schema"].contractors.id, id)).limit(1);
        return rows[0] ?? null;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$file$2d$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fileStore"].getContractor(id);
}
async function getContractorByEmail(email) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hasDatabase"])()) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDb"])();
        const rows = await db.select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__schema$3e$__["schema"].contractors).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__schema$3e$__["schema"].contractors.email, email.toLowerCase())).limit(1);
        return rows[0] ?? null;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$file$2d$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fileStore"].getContractorByEmail(email);
}
async function updateContractorSettings(id, patch) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hasDatabase"])()) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDb"])();
        await db.update(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__schema$3e$__["schema"].contractors).set(patch).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__schema$3e$__["schema"].contractors.id, id));
    } else {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$file$2d$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fileStore"].updateContractor(id, patch);
    }
    return getContractorById(id);
}
}),
"[project]/src/components/Nav.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "$$RSC_SERVER_ACTION_0",
    ()=>$$RSC_SERVER_ACTION_0,
    "Nav",
    ()=>Nav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"00b51cb04bd77c271b27193e68df41323c7c53cd75":{"name":"$$RSC_SERVER_ACTION_0"}},"src/components/Nav.tsx",""] */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/session.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$contractors$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/contractors.ts [app-rsc] (ecmascript)");
;
;
;
;
;
async function Nav() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    const contractor = session ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$contractors$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getContractorById"])(session.contractorId) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "mb-6 flex items-center justify-between gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                href: "/",
                className: "text-lg font-bold text-amber-500",
                children: "SiteQuote"
            }, void 0, false, {
                fileName: "[project]/src/components/Nav.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 text-sm",
                children: contractor ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "hidden text-zinc-500 sm:inline",
                            children: contractor.companyName
                        }, void 0, false, {
                            fileName: "[project]/src/components/Nav.tsx",
                            lineNumber: 19,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "/price-list",
                            className: "text-zinc-400 hover:text-white",
                            children: "Prices"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Nav.tsx",
                            lineNumber: 22,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "/settings",
                            className: "text-zinc-400 hover:text-white",
                            children: "Settings"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Nav.tsx",
                            lineNumber: 25,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(LogoutButton, {}, void 0, false, {
                            fileName: "[project]/src/components/Nav.tsx",
                            lineNumber: 28,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "/login",
                            className: "text-zinc-400 hover:text-white",
                            children: "Log in"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Nav.tsx",
                            lineNumber: 32,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "/register",
                            className: "rounded-lg bg-zinc-800 px-3 py-1.5 text-white hover:bg-zinc-700",
                            children: "Sign up"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Nav.tsx",
                            lineNumber: 35,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/src/components/Nav.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Nav.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
const $$RSC_SERVER_ACTION_0 = async function action() {
    const { destroySession } = await __turbopack_context__.A("[project]/src/lib/auth/session.ts [app-rsc] (ecmascript, async loader)");
    const { redirect } = await __turbopack_context__.A("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript, async loader)");
    await destroySession();
    redirect("/");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "00b51cb04bd77c271b27193e68df41323c7c53cd75", null);
function LogoutButton() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        action: $$RSC_SERVER_ACTION_0,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            type: "submit",
            className: "text-zinc-400 hover:text-white",
            children: "Log out"
        }, void 0, false, {
            fileName: "[project]/src/components/Nav.tsx",
            lineNumber: 59,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Nav.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/components/Nav.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Nav$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Nav.tsx [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/components/Nav.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00b51cb04bd77c271b27193e68df41323c7c53cd75",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Nav$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$components$2f$Nav$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/components/Nav.tsx [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Nav$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Nav.tsx [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0v6j5wm._.js.map