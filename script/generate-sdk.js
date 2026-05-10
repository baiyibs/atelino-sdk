#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import converter from 'swagger2openapi';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const SWAGGER_RAW_URL = process.env.SWAGGER_RAW_URL || 'https://raw.githubusercontent.com/baiyibs/atelino-api/refs/heads/master/pkg/docs/swagger.json';
const TEMP_DIR = path.join(rootDir, 'temp');
const SWAGGER2_FILE = path.join(TEMP_DIR, 'swagger2.json');
const OPENAPI3_FILE = path.join(TEMP_DIR, 'openapi3.json');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

async function main() {
    try {
        console.log(`Step 1: Downloading Swagger 2.0 from ${SWAGGER_RAW_URL}`);
        execSync(`curl -s -o "${SWAGGER2_FILE}" "${SWAGGER_RAW_URL}"`, { stdio: 'inherit' });
        console.log('Download completed.');

        console.log('Step 2: Converting to OpenAPI 3.0...');
        const swaggerContent = fs.readFileSync(SWAGGER2_FILE, 'utf8');
        const swaggerObj = JSON.parse(swaggerContent);

        await new Promise((resolve, reject) => {
            converter.convertObj(swaggerObj, { patch: true, warnOnly: true }, (err, result) => {
                if (err) return reject(err);
                fs.writeFileSync(OPENAPI3_FILE, JSON.stringify(result.openapi, null, 2));
                console.log('Conversion completed.');
                resolve();
            });
        });

        console.log('Step 3: Generating TypeScript SDK with @hey-api/openapi-ts...');
        execSync(`npx openapi-ts --input "${OPENAPI3_FILE}" --output src/client --plugins @hey-api/client-fetch @hey-api/sdk @hey-api/types`, {
            stdio: 'inherit',
            cwd: rootDir,
        });
        console.log('SDK generation completed. Output directory: src/client');
    } catch (error) {
        console.error('Generation failed:', error.message);
        process.exit(1);
    }
}

main();