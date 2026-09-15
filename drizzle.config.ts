
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

import { existsSync } from "fs";
if (existsSync(".env.local")) dotenv.config({ path: ".env.local", override: true });
else dotenv.config({ override: true });

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL || "postgres://localhost:5432/procurement_db",
    },
});
