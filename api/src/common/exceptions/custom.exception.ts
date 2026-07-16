import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    const response = {
      statusCode,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    };

    super(response, statusCode);
  }
}

export class ResourceNotFoundException extends CustomException {
  constructor(resource: string, identifier?: string | number) {
    const message = `${resource}${identifier ? ` with id ${identifier}` : ''} not found`;
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class DuplicateResourceException extends CustomException {
  constructor(resource: string, field: string) {
    const message = `${resource} with this ${field} already exists`;
    super(message, HttpStatus.CONFLICT);
  }
}

export class ValidationException extends CustomException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}

export class UnauthorizedException extends CustomException {
  constructor(message = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends CustomException {
  constructor(message = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ConflictException extends CustomException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.CONFLICT, details);
  }
}

export class InternalServerException extends CustomException {
  constructor(message = 'Internal server error', details?: Record<string, any>) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
}

export class ServiceUnavailableException extends CustomException {
  constructor(message = 'Service unavailable') {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
