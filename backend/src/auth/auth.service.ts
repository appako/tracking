import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EnvService } from '../common/env.service';
import { AuthResponseDto } from './auth.dto';

@Injectable()
export class AuthService {
    constructor(private envSvc: EnvService) {}

    login(apiKey: string): AuthResponseDto {
        if (!this.isValidApiKey(apiKey)) {
            throw new UnauthorizedException('Invalid API key');
        }
        return { valid: true, apiKey };
    }

    verify(apiKey: string): AuthResponseDto {
        const valid = this.isValidApiKey(apiKey);
        return { valid, apiKey };
    }

    isValidApiKey(apiKey: string): boolean {
        return this.envSvc.VALID_API_KEYS.includes(apiKey);
    }
}
