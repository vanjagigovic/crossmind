import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { UserService } from '../../user/user.service.js';
import type { UserRole } from '../../user/domain/user.js';
import { JwtTokenService } from '../security/jwt.service.js';

export type AuthenticatedUser = {
  id: string;
  isGuest: boolean;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const [scheme, token, ...extraParts] =
      authorization?.trim().split(/\s+/) ?? [];

    if (scheme?.toLowerCase() !== 'bearer' || !token || extraParts.length > 0) {
      throw new UnauthorizedException();
    }

    let payload;

    try {
      payload = await this.jwtTokenService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new UnauthorizedException('Invalid access token');
    }

    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid access token');
    }

    request.user = {
      id: user.id,
      isGuest: user.isGuest,
      role: user.role,
    };

    return true;
  }
}
