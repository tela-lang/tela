// Token Type Definitions
const TokenType = {
  KEYWORD: 'KEYWORD',
  IDENTIFIER: 'IDENTIFIER',
  PUNCTUATION: 'PUNCTUATION',
  OPERATOR: 'OPERATOR',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  EOF: 'EOF'
};

const Keywords = [
  'component',
  'state',
  'prop',
  'function',
  'view',
  'style',
  'import',
  'from',
  'export',
  'default',
  'if',
  'else',
  'for',
  'in',
  'return',
  'true',
  'false',
  'null',
  'bind',
  'onMount',
  'onDestroy',
  'onUpdate',
  'computed',
  'watch',
  'async',
  'await',
  'emit',
  // Error handling
  'try',
  'catch',
  'finally',
  'throw',
  // Control flow
  'switch',
  'case',
  'while',
  'break',
  'continue',
  // Declarations
  'enum',
  'model',
  'route',
  'store',
  // Constructor
  'new',
];

module.exports = {
  TokenType,
  Keywords
};
