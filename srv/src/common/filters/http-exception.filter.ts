import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || null,
      error: exception.name,
      details: status !== HttpStatus.INTERNAL_SERVER_ERROR
        ? exception.getResponse()
        : 'Internal server error',
    };

    // Log errors for monitoring
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception.stack,
        'HttpExceptionFilter',
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - Status ${status}`,
        JSON.stringify(errorResponse),
      );
    }

    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      errorResponse.details = 'Internal server error';
    }

    response.status(status).json(errorResponse);
  }
}
