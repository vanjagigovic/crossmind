import { Injectable, OnModuleDestroy } from "@nestjs/common";

import { db, pool } from "./db.js";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  get client() {
    return db;
  }

  async onModuleDestroy() {
    await pool.end();
  }
}