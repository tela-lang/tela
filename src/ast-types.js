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

  // Responsive styles
  MEDIA_QUERY: 'MediaQuery',

  // Error handling
  TRY_STMT: 'TryStatement',
  THROW_STMT: 'ThrowStatement',

  // Switch (function bodies)
  SWITCH_STMT: 'SwitchStatement',

  // Switch (view blocks — compiles to hoisted ternaries)
  VIEW_SWITCH: 'ViewSwitch',

  // Top-level declarations
  ENUM_DECL: 'EnumDeclaration',
  MODEL_DECL: 'ModelDeclaration',

  // Routing
  ROUTE_DECLARATION: 'RouteDeclaration',

  // Optional chaining
  OPTIONAL_CHAIN: 'OptionalChain',

  // Loops
  WHILE_STMT: 'WhileStatement',
  BREAK_STMT: 'BreakStatement',
  CONTINUE_STMT: 'ContinueStatement',
  FOR_IN_STMT: 'ForInStatement',    // for (item in list) in function bodies
  FOR_CLASSIC: 'ForClassicStatement', // for (i = 0; i < n; i = i + 1)
};

module.exports = {
  ASTType
};
