import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsHttpFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();

      response.status(status).json({
        statusCode: status,
        message: this.extractMessage(responseBody),
      });
    } else {
      // Error inesperado: no es HttpException
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }

  private extractMessage(response: any): string | string[] {
    if (typeof response === 'string') return response;
    if (typeof response === 'object' && response.message)
      return response.message;
    return 'Unexpected error';
  }
}
