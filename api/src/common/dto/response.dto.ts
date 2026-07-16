export class ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  timestamp: Date;
  path?: string;
  method?: string;
  errors?: Record<string, any>;

  constructor(
    statusCode: number,
    message: string,
    data?: T,
    errors?: Record<string, any>,
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date();
    this.errors = errors;
  }

  static success<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
    return new ApiResponse(statusCode, message, data);
  }

  static error<T>(
    statusCode: number,
    message: string,
    errors?: Record<string, any>,
  ): ApiResponse<T | undefined> {
    return new ApiResponse(statusCode, message, undefined, errors);
  }
}

export class PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  constructor(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Success',
  ) {
    super(200, message, data);
    this.pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}
