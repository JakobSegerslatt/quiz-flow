export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function badRequest(message: string, details?: unknown): AppError {
  return new AppError(400, message, 'BAD_REQUEST', details);
}

export function unauthorized(message = 'Unauthorized'): AppError {
  return new AppError(401, message, 'UNAUTHORIZED');
}

export function forbidden(message = 'Forbidden'): AppError {
  return new AppError(403, message, 'FORBIDDEN');
}

export function notFound(message: string): AppError {
  return new AppError(404, message, 'NOT_FOUND');
}

export function conflict(message: string): AppError {
  return new AppError(409, message, 'CONFLICT');
}
