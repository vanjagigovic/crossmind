import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { AccessTokenGuard } from './access-token.guard.js';
import { AdminGuard } from './admin.guard.js';

function createContext(authorization?: string, user?: object) {
  const request = {
    headers: authorization ? { authorization } : {},
    user,
  };

  return {
    request,
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext,
  };
}

describe('AccessTokenGuard', () => {
  it('rejects a request without an access token', async () => {
    const jwtTokenService = { verifyAccessToken: vi.fn() };
    const userService = { findById: vi.fn() };
    const guard = new AccessTokenGuard(
      jwtTokenService as any,
      userService as any,
    );
    const { context } = createContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtTokenService.verifyAccessToken).not.toHaveBeenCalled();
  });

  it('loads the authorization role from the user record, not the token', async () => {
    const jwtTokenService = {
      verifyAccessToken: vi.fn().mockResolvedValue({
        sub: 'user-1',
        isGuest: false,
        role: 'ADMIN',
      }),
    };
    const userService = {
      findById: vi.fn().mockResolvedValue({
        id: 'user-1',
        isGuest: false,
        role: 'USER',
      }),
    };
    const guard = new AccessTokenGuard(
      jwtTokenService as any,
      userService as any,
    );
    const { context, request } = createContext('Bearer valid-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 'user-1',
      isGuest: false,
      role: 'USER',
    });
    expect(userService.findById).toHaveBeenCalledWith('user-1');
  });
});

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  it('rejects a request without an authenticated user with 401', () => {
    const { context } = createContext();

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects a USER with 403', () => {
    const { context } = createContext(undefined, {
      id: 'user-1',
      role: 'USER',
      isGuest: false,
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows an ADMIN', () => {
    const { context } = createContext(undefined, {
      id: 'admin-1',
      role: 'ADMIN',
      isGuest: false,
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});
