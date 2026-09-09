import { Injectable, OnModuleDestroy } from "@nestjs/common";

import { db, pool } from "./db.js";

export type DatabaseClient = typeof db;
export type DatabaseTransaction = Parameters<
  Parameters<DatabaseClient["transaction"]>[0]
>[0];

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  get client(): DatabaseClient {
    return db;
  }

  async transaction<T>(
    fn: (tx: DatabaseTransaction) => Promise<T>,
  ): Promise<T> {
    return db.transaction(fn);
  }

  async onModuleDestroy() {
    await pool.end();
  }
}