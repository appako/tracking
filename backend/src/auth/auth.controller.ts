import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from './auth.decorators';
import { AuthResponseDto, LoginDto, ValidateKeyDto } from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Authenticate with API key' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    @ApiUnauthorizedResponse()
    @ApiBadRequestResponse()
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto.apiKey);
    }

    @Public()
    @Post('validate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Validate API key' })
    @ApiBody({ type: ValidateKeyDto })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    verify(@Body() validateDto: ValidateKeyDto) {
        return this.authService.verify(validateDto.apiKey);
    }
}
