import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['src/**/*.{test,spec}.{ts,js}'],
		coverage: {
			include: ['src/**'],
			exclude: ['**/*.{d,test,spec}.ts']
		}
	}
});
