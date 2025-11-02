import {} from 'express';

export type User = { apiKey: string };

declare module 'express' {
    interface Request {
        user?: User | null;
    }
}
