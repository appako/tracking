import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    apiKey!: string;
}

export class ValidateKeyDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    apiKey!: string;
}

export class AuthResponseDto {
    @ApiProperty()
    @IsBoolean()
    valid!: boolean;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    apiKey!: string;
}
