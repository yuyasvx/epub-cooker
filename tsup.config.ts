import { fixImportsPlugin } from 'esbuild-fix-imports-plugin';
import { defineConfig } from 'tsup';

const envName = process.env.ENV_NAME;

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.*', '!src/**/*.spec.*'],
  format: ['cjs'],
  target: 'node22',
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: envName === 'local',
  outDir: 'dist',
  tsconfig: 'tsconfig.build.json',
  skipNodeModulesBundle: true,
  bundle: false,
  esbuildPlugins: [fixImportsPlugin()],
  minify: envName !== 'local',
});
