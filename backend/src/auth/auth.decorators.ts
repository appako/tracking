import { createParamDecorator, ExecutionContext, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { User } from './auth.types';

export type Auth = { user: User };
export const Auth = createParamDecorator((_: void, context: ExecutionContext): Auth => {
    const { user } = context.switchToHttp().getRequest<Request>();
    if (!user) throw new UnauthorizedException();
    return { user };
});

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
