/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce scopes — must be one of the defined modules
    'scope-enum': [2, 'always', [
      'auth',       // authentication module
      'oauth',      // OAuth2 flows
      'token',      // token service / rotation
      'rbac',       // roles + permissions
      'users',      // user profile
      'admin',      // admin panel
      'audit',      // audit logging
      'middleware',
      'config',
      'types',
      'ci',
      'deps',
      'docs',
      'release',
    ]],
    // Header max length
    'header-max-length': [2, 'always', 100],
    // Body must have blank line before
    'body-leading-blank': [2, 'always'],
    // Footer must have blank line before
    'footer-leading-blank': [2, 'always'],
    // Enforce additional type: security
    'type-enum': [2, 'always', [
      'feat',
      'fix',
      'security',
      'docs',
      'style',
      'refactor',
      'test',
      'chore',
      'ci',
      'revert',
      'perf',
    ]],
  },
}