module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'array-callback-return': 'warn',
    'eqeqeq': ["error", "always", {"null": "ignore"}],
    'no-empty-function': 'warn',
    'no-eval': 'warn',
    'no-implied-eval': 'warn',
    'no-invalid-this': 'error',
    'no-return-assign': 'error',
    'no-return-await': 'error',
    'no-self-compare': 'warn',
    'no-useless-concat': 'warn',
    'no-useless-return': 'warn',
    'no-void': 'error',
    'no-warning-comments': 'warn',
    'no-with': 'error',
    'prefer-promise-reject-errors': 'error',
    'no-shadow-restricted-names': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-rename': 'error',
    'prefer-const': 'error',
    
    // style rules
    'semi': ['error', 'never'],
    'wrap-iife': ['warn', 'inside'],
    'no-trailing-spaces': 'error',
    'quotes': ["warn", "double"],
    'arrow-spacing': 'warn',
  },
};
