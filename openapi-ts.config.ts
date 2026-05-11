import { defineConfig } from '@hey-api/openapi-ts';

// @ts-ignore
export default defineConfig({
	input:
		'https://raw.githubusercontent.com/baiyibs/atelino-api/refs/heads/master/pkg/docs/swagger.json',
	output: {
		path: 'src',
		clean: true,
	},
	plugins: ['@hey-api/sdk', '@hey-api/client-fetch'],
});
