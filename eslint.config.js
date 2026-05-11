import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.astro/**',
      '**/.turbo/**',
      '**/.wrangler/**',
      '**/.mf/**',
      '**/coverage/**',
      '**/*.min.*',
      'pnpm-lock.yaml',
      // env.d.ts es generado por Astro y usa triple-slash references por diseño
      '**/env.d.ts',
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...astro.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Reglas globales — alineadas con el tsconfig estricto del root
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Scripts inline de Astro corren en el browser
  {
    files: ['**/*.astro/*.js', '**/*.astro/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Prettier siempre al final para desactivar reglas que chocan con formato
  prettier,
];
