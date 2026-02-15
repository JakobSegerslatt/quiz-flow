import { NextFunction, Request, Response } from 'express';
import { unauthorized, forbidden } from '../domain/errors';
import { UserRole } from '../domain/session';

export interface RequestUser {
  id: string;
  role: UserRole;
  displayName?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: RequestUser;
  }
}

function readBearerToken(request: Request): string | null {
  const value = request.header('authorization');

  if (!value?.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  return value.slice(7).trim();
}

export function authenticateRequest(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const token = readBearerToken(request);

  if (!token) {
    next();
    return;
  }

  if (token === 'admin-token') {
    request.user = { id: 'admin-1', role: 'admin' };
    next();
    return;
  }

  if (token === 'host-token') {
    request.user = { id: 'host-1', role: 'host' };
    next();
    return;
  }

  if (token.startsWith('participant-')) {
    const participantId = token.replace('participant-', '');
    request.user = { id: participantId, role: 'participant' };
    next();
    return;
  }

  next(unauthorized('Invalid authentication token.'));
}

export function requireRole(allowedRoles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const user = request.user;

    if (!user) {
      next(unauthorized());
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(forbidden());
      return;
    }

    next();
  };
}
