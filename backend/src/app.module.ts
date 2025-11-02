import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppLogMiddleware, AppMiddleware } from './app.middleware';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { ObjectsModule } from './objects/objects.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, ObjectsModule],
    controllers: [],
    providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AppMiddleware, AppLogMiddleware).forRoutes('*path');
    }
}
