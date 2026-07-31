/** @type {import('lint-staged').Config} */
export default {
  // TypeScript + TSX: ESLint fix + Prettier format
  '**/*.{ts,tsx}': ['eslint --fix --max-warnings=0 --no-warn-ignored', 'prettier --write'],
  // JS + MJS config files
  '**/*.{js,mjs,cjs}': ['eslint --fix', 'prettier --write'],
  // JSON, YAML, Markdown: Prettier only
  '**/*.{json,yml,yaml,md}': ['prettier --write'],
  // Shell scripts: check syntax
  '**/*.sh': ['bash -n'],
}
