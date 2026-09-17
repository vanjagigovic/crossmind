import { Injectable } from "@nestjs/common";
import { JwtService as NestJwtService } from "@nestjs/jwt";

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: NestJwtService) {}
}