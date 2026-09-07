const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required. Set it before running this script.");
  process.exit(1);
}

const hostname = new URL(databaseUrl).hostname;
const client = new Client({
  connectionString: databaseUrl,
  ...(hostname.endsWith("render.com")
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});

async function runSqlFile(filename) {
  const sql = fs.readFileSync(path.join(__dirname, "../db", filename), "utf8");
  await client.query(sql);
  console.log(`Applied ${filename}`);
}

async function main() {
  await client.connect();
  await runSqlFile("schema.sql");
  await runSqlFile("seed.sql");
  console.log("Database setup completed.");
}

main()
  .catch((error) => {
    console.error("Database setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
