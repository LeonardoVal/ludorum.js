import fs from 'node:fs';
import path from 'node:path';
import terser from '@rollup/plugin-terser';
import { optimizeDeps } from 'vite';

function getFileNamesByLibFormat(packageName) {
  const libName = /^@.*?\/(.*)$/.exec(packageName)?.[1] ?? packageName;
  return {
    es: `${libName}.es.mjs`,
    umd: `${libName}.umd.js`,
  };
}

function readPackageJSON(packageFilePath) {
  const packageJSON = fs.readFileSync(packageFilePath, { encoding: 'utf8' });
  return JSON.parse(packageJSON);
}

export function viteConfig(options) {
  const packageFilePath = options?.packageFilePath ?? 
    path.resolve(process.cwd(), 'package.json');
  const pkg = readPackageJSON(packageFilePath);
  const { name, dependencies } = pkg;
  const fileNamesByLibFormat = getFileNamesByLibFormat(name);

  return {
    build: {
      lib: {
        entry: path.resolve(path.dirname(packageFilePath), 'src/index.js'),
        fileName: (format) => fileNamesByLibFormat[format],
        formats: Object.keys(fileNamesByLibFormat),
        name: pkg.name,
      },
      minify: 'terser',
      rollupOptions: {
        external: Object.keys(dependencies ?? {}),
        plugins: [
          terser({
            keep_classnames: true,
            module: true,
          }),
        ],
      },
      sourcemap: true,
    },
    cacheDir: './.vite',
    plugins: [],
    test: {
      coverage: {
        clean: true,
        enabled: true,
        include: [
          'src/**/*.{js,mjs}'
        ],
        provider: 'istanbul',
        reporter: [
          'html',
          'text',
        ],
        reportsDirectory: '.vite/vitest/coverage',
      },
      watch: false,
    },
  };
}; // viteConfig
