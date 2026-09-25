import { Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";

@Injectable()
export class TokenHashService {
    hash(token: string): string {
        return createHash("sha256")
            .update(token)
            .digest("hex");
    }

    matches(token: string, expectedHash: string): boolean {
        const actualHash = this.hash(token);
        return actualHash === expectedHash;
    }
}