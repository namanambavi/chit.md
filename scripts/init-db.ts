import { getMigrations } from "better-auth/db/migration";
import { auth } from "../lib/auth";
import { initializeProductSchema } from "../lib/db";

async function main() {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  await initializeProductSchema();
  console.log("chit.md database is ready.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
