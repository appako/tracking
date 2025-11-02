import dotenv from 'dotenv';
import { defineConfig } from 'orval';

// Load environment variables
dotenv.config();

const API_HOST = process.env.API_HOST || 'http://localhost:8000';

export default defineConfig({
    api: {
        input: {
            target: `${API_HOST}/api-json`,
        },
        output: {
            target: './src/api/generated.ts',
            client: 'react-query',
            mode: 'split',
            prettier: true,
            override: {
                mutator: {
                    path: './src/api/axios.instance.ts',
                    name: 'axiosInstance',
                },
            },
        },
    },
});
