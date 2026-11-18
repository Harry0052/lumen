import { databasePath, getSqlite } from "./client";

getSqlite();
console.log(`Lumen database is migrated at ${databasePath()}`);
