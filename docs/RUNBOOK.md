# Lumen runbook

This describes how to run the local app and how to roll back its SQLite file. It is not a production certification.

## Requirements

- Node.js 22 or newer
- No API keys
- A writable `data/` directory

## First run

```bash
npm install
npm run db:setup
npm run dev
```

`npm run db:setup` runs `src/lib/db/setup.ts`, which opens `LUMEN_DB_PATH` (default `data/lumen.db`), applies every SQL file in `drizzle/migrations` once, and seeds the demo guides if they are missing.

## Environment

| Name | Required | Purpose |
| --- | --- | --- |
| `LUMEN_DB_PATH` | No | SQLite file. Default `data/lumen.db`. |
| `LUMEN_EDITOR_CODE` | No | Unlocks the editor desk. When unset, the desk uses `local-desk` and says so. Set a unique value before anyone else can reach the server. Do not commit it. |

There is no language-model variable that turns a feature on. Lumen does not call an outside model.

## Migrations

Migrations are ordered SQL files. The runner records the file name in `schema_migrations` and skips names it has already applied. It does not roll a file back by itself.

To add a migration, add a new `drizzle/migrations/0002_something.sql`. Do not edit a file that has already been applied to a database you care about.

## Rollback

The local database is one file (plus `-wal` and `-shm` while the process is running).

1. Stop the Node process so SQLite can checkpoint.
2. Copy `data/lumen.db` (and the `-wal` / `-shm` files if they exist) to a dated backup before a migration.
3. To roll back, stop the process, replace the file with the backup, and start again.
4. Do not delete `schema_migrations` rows by hand unless you also restore the matching file. A half-applied file is easier to replace with the backup than to patch.

Demo guide text lives in the database after seed. Restoring an older file restores older guide text too.

## Incident notes

- A person can delete only the session in their browser, from Your data. Demo guides are not deleted.
- Session tokens are stored as SHA-256 hashes. The audit table stores event names and short metadata. It does not store feedback notes, passwords, or the editor code.
- If the editor desk was left on the sandbox code, set `LUMEN_EDITOR_CODE`, restart, and treat any guide marked reviewed during that window as needing another look.
- Logs from `logFailure` include a scope, a code, and a short detail. They are not a metrics product.
- There is no email or SMS path. An incident does not page anyone from this app.

## What this runbook does not claim

Hosting, backups, access control, and monitoring for a public server are not set up here. CI runs lint, typecheck, unit tests, the production build, and Playwright against a fresh SQLite file. That is the checked path. It is not a launch approval.
