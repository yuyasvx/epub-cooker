import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['cobertura', 'html'], // html 指定してれば他はいらんかも
      reportsDirectory: './coverage', // レポートの保存先を適当に指定
      clean: true,
      include: ['src/**/*.ts'],
    },
  },
});
