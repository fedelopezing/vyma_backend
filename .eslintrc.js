module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  'max-len': [
    'error',
    {
      code: 85,  // Esto hará que las líneas se dividan después de 90 caracteres
      ignoreUrls: true,  // No aplica esta regla a URLs largas
      ignoreComments: false,  // Considera los comentarios también
      ignoreTrailingComments: false,  // No ignorará los comentarios al final de una línea
      ignoreStrings: false,  // Considera las cadenas en la validación
      ignoreTemplateLiterals: false,  // Considera las plantillas literales
    },
  ],
};
