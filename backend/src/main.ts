import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EnvService } from './common/env.service';

const log = new Logger('MAIN');

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const isProd = process.env.NODE_ENV === 'production';

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            stopAtFirstError: true,
            enableDebugMessages: !isProd,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
            whitelist: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('Object Tracking API')
        .setDescription('API for tracking objects on map with real-time updates')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const { CORS_ORIGIN, PORT, HOST } = app.get(EnvService);
    app.enableCors({ origin: CORS_ORIGIN });
    await app.listen(PORT);

    log.debug(`Application is running on: ${HOST}:${PORT}`);
    log.debug(`Swagger documentation: ${HOST}:${PORT}/api`);
    log.log('Application started successfully');
}

bootstrap().catch(console.error);
