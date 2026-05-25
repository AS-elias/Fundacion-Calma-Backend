import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extraer mensaje y error code
    let message = 'Error en el servidor';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || message;

      // Si es un array de mensajes (class-validator), unirlos
      if (Array.isArray(message)) {
        message = message.join(', ');
      }

      errorCode = this.getErrorCode(status, message);
    }

    // Log del error
    this.logger.warn(
      `${request.method} ${request.url} - ${status} - ${message}`,
    );

    // Respuesta estandarizada
    response.status(status).json({
      success: false,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getErrorCode(status: number, message: string): string {
    const errorCodeMap: { [key: number]: string } = {
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
    };

    return errorCodeMap[status] || 'UNKNOWN_ERROR';
  }
}
