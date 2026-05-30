import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import path from "path";

import type { Database as DatabaseSchema } from "./database.types";

const databasePath = path.join(process.cwd(), "data", "exams.db");

let database: Kysely<DatabaseSchema> | null = null;

export function getDatabase(): Kysely<DatabaseSchema> {
  if (!database) {
    const sqlite = new Database(databasePath, { readonly: true });

    database = new Kysely<DatabaseSchema>({
      dialect: new SqliteDialect({
        database: sqlite,
      }),
    });
  }

  return database;
}
