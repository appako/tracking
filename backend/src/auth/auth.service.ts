import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from './auth.dto';

@Injectable()
export class AuthService {
    private readonly validApiKeys: string[];

    constructor(private configService: ConfigService) {
        const apiKeysString = this.configService.get<string>('VALID_API_KEYS', '');
        this.validApiKeys = apiKeysString.split(',').map(key => key.trim());
    }

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
        return this.validApiKeys.includes(apiKey);
    }
}
