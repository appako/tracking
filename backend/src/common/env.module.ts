import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvService } from './env.service';

@Global()
@Module({
    imports: [ConfigModule.forRoot()],
    providers: [{ provide: EnvService, useFactory: () => EnvService.fromEnv(process.env) }],
    exports: [EnvService],
})
export class EnvModule {}
