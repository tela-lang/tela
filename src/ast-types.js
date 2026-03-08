const ASTType = {
  PROGRAM: 'Program',
  COMPONENT: 'Component',
  STATE_DECLARATION: 'StateDeclaration',
  PROP_DECLARATION: 'PropDeclaration',
  FUNCTION_DECLARATION: 'FunctionDeclaration',
  VIEW_DECLARATION: 'ViewDeclaration',
  ELEMENT: 'Element',
  ATTRIBUTE: 'Attribute',
  STYLE_BLOCK: 'StyleBlock',
  STYLE_PROPERTY: 'StyleProperty',
  EVENT_HANDLER: 'EventHandler',
  CONDITIONAL: 'Conditional',
  LOOP: 'Loop',
  EXPRESSION: 'Expression',
  LITERAL: 'Literal',
  ARRAY_LITERAL: 'ArrayLiteral',
  OBJECT_LITERAL: 'ObjectLiteral',
  IDENTIFIER: 'Identifier',
  BIND_DIRECTIVE: 'BindDirective',

  // Expression nodes (Pratt parser)
  BINARY_EXPR: 'BinaryExpression',
  UNARY_EXPR: 'UnaryExpression',
  CALL_EXPR: 'CallExpression',
  MEMBER_EXPR: 'MemberExpression',
  TERNARY_EXPR: 'TernaryExpression',

  // Statement nodes (function bodies)
  ASSIGNMENT_STMT: 'AssignmentStatement',
  EXPR_STMT: 'ExpressionStatement',
  IF_STMT: 'IfStatement',
  RETURN_STMT: 'ReturnStatement',

  // Async
  AWAIT_EXPR: 'AwaitExpression',

  // Parent-child communication
  EMIT_STMT: 'EmitStatement',

  // New features
  LIFECYCLE_HOOK: 'LifecycleHook',
  COMPUTED_PROP: 'ComputedProperty',
  WATCHER: 'Watcher',
  IMPORT_DECL: 'ImportDeclaration',
};

module.exports = {
  ASTType
};
