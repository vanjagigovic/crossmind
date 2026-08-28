import { Injectable, OnModuleDestroy } from "@nestjs/common";

import { pool } from "./db.js";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  async onModuleDestroy() {
    await pool.end();
  }
}