#!/usr/bin/env tsx
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SCHEMA_PATH = join(process.cwd(), "prisma", "schema.prisma");
const ENV_PATH = join(process.cwd(), ".env");

const provider = process.argv[2];

if (provider !== "sqlite" && provider !== "postgresql") {
  console.error("Usage: pnpm db:switch <sqlite|postgresql>");
  process.exit(1);
}

let schema = readFileSync(SCHEMA_PATH, "utf-8");
let env = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf-8") : "";

if (provider === "sqlite") {
  schema = schema
    .replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"')
    .replace(/@\s*db\.Decimal\(10,\s*2\)/g, "")
    .replace(/@\s*db\.Date/g, "");

  const newEnv = env
    .split("\n")
    .map((line) => {
      if (line.startsWith("DATABASE_URL=")) {
        return 'DATABASE_URL="file:./dev.db"';
      }
      return line;
    })
    .join("\n");

  writeFileSync(ENV_PATH, newEnv);
  console.log("Switched to SQLite. Database URL set to file:./dev.db");
} else {
  schema = schema
    .replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"')
    .replace(/pricePerNight\s+Decimal(\s*)/g, "pricePerNight Decimal @db.Decimal(10, 2)$1")
    .replace(/checkIn\s+DateTime(\s*$)/gm, "checkIn DateTime @db.Date$1")
    .replace(/checkOut\s+DateTime(\s*$)/gm, "checkOut DateTime @db.Date$1")
    .replace(/totalAmount\s+Decimal(\s*)/g, "totalAmount Decimal @db.Decimal(10, 2)$1")
    .replace(/amount\s+Decimal(\s*)/g, "amount Decimal @db.Decimal(10, 2)$1");

  const newEnv = env
    .split("\n")
    .map((line) => {
      if (line.startsWith("DATABASE_URL=")) {
        return 'DATABASE_URL="postgresql://staylocal:staylocal@localhost:5432/staylocal?schema=public"';
      }
      return line;
    })
    .join("\n");

  writeFileSync(ENV_PATH, newEnv);
  console.log("Switched to PostgreSQL. Database URL set to localhost:5432");
}

writeFileSync(SCHEMA_PATH, schema);
console.log(`Schema updated. Run 'pnpm db:generate && pnpm db:migrate' to apply changes.`);