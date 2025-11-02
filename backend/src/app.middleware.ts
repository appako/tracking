import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth/auth.service';

@Injectable()
export class AppMiddleware implements NestMiddleware {
    log = new Logger(this.constructor.name);

    constructor(private authSvc: AuthService) {}

    use(req: Request, _res: Response, next: NextFunction) {
        const apiKey = req.headers.authorization;
        if (apiKey && this.authSvc.isValidApiKey(apiKey)) {
            const user = { apiKey: apiKey };
            req.user = user;
        }
        next();
    }
}

@Injectable()
export class AppLogMiddleware implements NestMiddleware {
    private readonly httpLogger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();

        res.on('finish', () => {
            const ms = Date.now() - start;
            const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`;

            if (res.statusCode >= 500) {
                this.httpLogger.error(message);
            } else if (res.statusCode >= 400) {
                this.httpLogger.warn(message);
            } else {
                this.httpLogger.log(message);
            }
        });

        next();
    }
}
