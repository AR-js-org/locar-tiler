import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        dts({
            include: ['lib/*.ts'],
            outDir: 'dist',
            rollupTypes: true,
            entryRoot: 'lib'
       })
    ],
	build: {
		lib: {
			entry: resolve(__dirname, 'lib/index.ts'),
            name: 'locar-tiler',
            filenName: (format) => `locar-tiler.${format}.js`
		}
	}
});
