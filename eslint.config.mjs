import vitestPlugin from '@vitest/eslint-plugin';
import configPrettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import pluginSort from 'eslint-plugin-sort';
import typescriptEslint from 'typescript-eslint';

export default [
  pluginImport.flatConfigs.recommended,
  ...typescriptEslint.configs.recommended,
  pluginSort.configs['flat/recommended'],
  {
    rules: {
      'import/no-unresolved': 'off',
      'import/order': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/member-ordering': 'warn',
      // 型定義しかインポートしていないのに、typeを付けないとバンドラがimport文に.js拡張子をつけてくれないことがあってバグの元になりそうなのでerror
      '@typescript-eslint/consistent-type-imports': 'error',
      // type importしかしていない場合は、`import type { hogehoge } from '...'` 構文に強制することでバンドラのバグを回避
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'import/no-duplicates': ["warn", {"prefer-inline": true}],
      'prefer-template': 'warn',
      'sort/object-properties': 'off',
      'import/no-internal-modules': [
        'warn',
        {
          allow: ['zod/v4'],
        },
      ],
      'arrow-body-style': ['warn', 'as-needed'],
      'prefer-destructuring': 'warn',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules, // you can also use vitest.configs.all.rules to enable all rules
      // 'vitest/max-nested-describe': ['error', { max: 3 }], // you can also modify rules' behavior using option like this
      'vitest/consistent-test-it': ['warn', { fn: 'test' }],
      'vitest/consistent-test-filename': ['warn', { pattern: '.*\\.spec\\.[tj]sx?$' }],
    },
  },
  { ignores: ['dist'] },
  configPrettier,
];
