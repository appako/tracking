import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

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

    app.enableCors({ origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',') });

    const port = process.env.PORT ?? 8000;
    const host = process.env.HOST ?? 'http://127.0.0.1';
    await app.listen(port);

    log.debug(`Application is running on: ${host}:${port}`);
    log.debug(`Swagger documentation: ${host}:${port}/api`);
    log.log('Application started successfully');
}

bootstrap().catch(console.error);
