import { defineConfig } from '@hey-api/openapi-ts';

// @ts-ignore
export default defineConfig({
    input: 'http://localhost:8080/swagger/doc.json',
    output: 'src',
    plugins: [
        '@hey-api/client-fetch',
        '@hey-api/sdk',
        '@hey-api/types',
    ],
});