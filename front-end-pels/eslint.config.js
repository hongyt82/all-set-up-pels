import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default tseslint.config([
  { ignores: ['dist', 'node_modules', '*.config.js', 'src/scripts/**/*.js', 'docs/**/*.md'] },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          allowExportNames: ['default', 'Button', 'Form', 'NavigationMenu', 'Sidebar', 'Toggle']
        },
      ],
      // Disallow ts-ignore; allow ts-expect-error only with description
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 5,
        },
      ],
      // Prefer type-only imports to satisfy verbatimModuleSyntax
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],
      // Discourage any; keep as warning for gradual adoption
      '@typescript-eslint/no-explicit-any': ['warn', {
        ignoreRestArgs: true
      }],
      // Encourage optional chaining/nullish coalescing
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      // Forbids parameter properties (aligns with erasableSyntaxOnly intent)
      '@typescript-eslint/parameter-properties': 'error',
      // Ensure no unused vars/imports (TS-aware)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'prettier/prettier': 'error',
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Looser rules for declaration files and config files
  {
    files: ['**/*.d.ts', '**/*.config.{js,ts}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  // Relaxed rules for API and utility files with heavy any usage
  {
    files: [
      'src/lib/apiClient.ts',
      'src/lib/requestBuilder.ts',
      'src/lib/fileService.ts',
      'src/utils/errorHandler.ts',
      'src/utils/helpers.ts',
      'src/utils/logger.ts',
      'src/types/index.ts'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  // Relaxed rules for test and API pages
  {
    files: [
      'src/pages/ApiTestPage.tsx',
      'src/pages/EditorPage.tsx'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Relaxed rules for common components with any usage
  {
    files: [
      'src/components/common/FileDownload.tsx',
      'src/components/common/FileUpload.tsx',
      'src/constants/routeGuardConfig.ts'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]);
