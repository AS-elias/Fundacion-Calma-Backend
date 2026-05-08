import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    // Cuando la respuesta termine, logueamos el resultado
    res.on('finish', () => {
      const { statusCode } = res;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - IP: ${ip} - Agent: ${userAgent}`,
      );
    });

    next();
  }
}
