const { TokenType } = require('./token-types');
const { ASTType } = require('./ast-types');
const { Tokenizer } = require('./tokenizer');

// Operator precedence for infix parsing
const INFIX_PREC = {
  '??': 1,
  '||': 2,
  '&&': 3,
  '===': 4, '!==': 4, '==': 4, '!=': 4,
  '<': 5, '>': 5, '<=': 5, '>=': 5,
  '+': 6, '-': 6,
  '*': 7, '/': 7, '%': 7,
};

class Parser {
  constructor(input) {
    this.tokenizer = new Tokenizer(input);
    this.tokens = this.tokenizer.tokenize();
    this.current = 0;
  }

  parse() {
    return this.parseProgram();
  }

  // --- Helper Methods ---

  peek() {
    return this.tokens[this.current];
  }

  peekAt(offset) {
    const idx = this.current + offset;
    return idx < this.tokens.length ? this.tokens[idx] : null;
  }

  advance() {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.tokens[this.current - 1];
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }

  check(type, value) {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    if (token.type !== type) return false;
    if (value && token.value !== value) return false;
    return true;
  }

  consume(type, message, value) {
    if (this.check(type, value)) {
      return this.advance();
    }
    const token = this.peek();
    throw new Error(`${message}. Found ${token.type} '${token.value}' at line ${token.line}, column ${token.column}`);
  }

  // --- Grammar Methods ---

  parseProgram() {
    const imports = [];
    const enums = [];
    const models = [];
    const stores = [];
    const components = [];

    while (!this.isAtEnd()) {
      const token = this.peek();
      if (token.type === TokenType.KEYWORD && token.value === 'import') {
        imports.push(this.parseImport());
      } else if (token.type === TokenType.KEYWORD && token.value === 'export') {
        this.advance(); // consume 'export'
        const next = this.peek();
        if (next.type === TokenType.KEYWORD && next.value === 'enum') {
          const e = this.parseEnum(); e.exported = true; enums.push(e);
        } else if (next.type === TokenType.KEYWORD && next.value === 'model') {
          const m = this.parseModel(); m.exported = true; models.push(m);
        } else if (next.type === TokenType.KEYWORD && next.value === 'store') {
          const s = this.parseStore(); s.exported = true; stores.push(s);
        } else {
          const component = this.parseComponent();
          component.exported = true;
          components.push(component);
        }
      } else if (token.type === TokenType.KEYWORD && token.value === 'component') {
        components.push(this.parseComponent());
      } else if (token.type === TokenType.KEYWORD && token.value === 'enum') {
        enums.push(this.parseEnum());
      } else if (token.type === TokenType.KEYWORD && token.value === 'model') {
        models.push(this.parseModel());
      } else if (token.type === TokenType.KEYWORD && token.value === 'store') {
        stores.push(this.parseStore());
      } else {
        this.advance(); // skip unknown tokens at top level
      }
    }

    return {
      type: ASTType.PROGRAM,
      imports,
      enums,
      models,
      stores,
      components
    };
  }

  parseImport() {
    this.consume(TokenType.KEYWORD, "Expected 'import'", 'import');
    const name = this.consume(TokenType.IDENTIFIER, 'Expected imported name').value;
    this.consume(TokenType.KEYWORD, "Expected 'from'", 'from');
    const path = this.consume(TokenType.STRING, 'Expected path string').value;
    return { type: ASTType.IMPORT_DECL, name, path };
  }

  parseComponent() {
    this.consume(TokenType.KEYWORD, "Expected 'component'", 'component');
    const name = this.consume(TokenType.IDENTIFIER, 'Expected component name').value;
    this.consume(TokenType.PUNCTUATION, "Expected '{' after component name", '{');

    const body = {
      state: [],
      props: [],
      functions: [],
      lifecycleHooks: [],
      computed: [],
      watchers: [],
      routes: [],
      view: null
    };

    while (!this.check(TokenType.PUNCTUATION, '}')) {
      const token = this.peek();

      if (token.type === TokenType.KEYWORD && token.value === 'state') {
        body.state.push(this.parseState());
      } else if (token.type === TokenType.KEYWORD && token.value === 'prop') {
        body.props.push(this.parseProp());
      } else if (token.type === TokenType.KEYWORD && token.value === 'async') {
        body.functions.push(this.parseFunction(true));
      } else if (token.type === TokenType.KEYWORD && token.value === 'function') {
        body.functions.push(this.parseFunction(false));
      } else if (token.type === TokenType.KEYWORD && token.value === 'view') {
        body.view = this.parseView();
      } else if (token.type === TokenType.KEYWORD &&
                 (token.value === 'onMount' || token.value === 'onDestroy' || token.value === 'onUpdate')) {
        body.lifecycleHooks.push(this.parseLifecycleHook());
      } else if (token.type === TokenType.KEYWORD && token.value === 'computed') {
        body.computed.push(this.parseComputedProp());
      } else if (token.type === TokenType.KEYWORD && token.value === 'watch') {
        body.watchers.push(this.parseWatcher());
      } else if (token.type === TokenType.KEYWORD && token.value === 'route') {
        if (body.routes.length >= 2) {
          throw new Error(`At most two 'route' declarations are allowed: one String (path) and one Object (params) at line ${token.line}`);
        }
        body.routes.push(this.parseRouteDecl());
      } else {
        throw new Error(`Unexpected token in component body: '${token.value}' at line ${token.line}`);
      }
    }

    this.consume(TokenType.PUNCTUATION, "Expected '}' after component body", '}');

    return {
      type: ASTType.COMPONENT,
      name,
      exported: false,
      ...body
    };
  }

  parseState() {
    this.consume(TokenType.KEYWORD, "Expected 'state'", 'state');
    const name = this.consume(TokenType.IDENTIFIER, 'Expected state name').value;
    this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
    const valueType = this.consume(TokenType.IDENTIFIER, 'Expected type').value;

    let defaultValue = null;
    if (this.check(TokenType.OPERATOR, '=')) {
      this.advance();
      defaultValue = this.parseExpression();
    }

    return {
      type: ASTType.STATE_DECLARATION,
      name,
      valueType,
      defaultValue
    };
  }

  parseProp() {
    this.consume(TokenType.KEYWORD, "Expected 'prop'", 'prop');
    const name = this.consume(TokenType.IDENTIFIER, 'Expected prop name').value;
    this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
    const valueType = this.consume(TokenType.IDENTIFIER, 'Expected type').value;

    let defaultValue = null;
    if (this.check(TokenType.OPERATOR, '=')) {
      this.advance();
      defaultValue = this.parseExpression();
    }

    return {
      type: ASTType.PROP_DECLARATION,
      name,
      valueType,
      defaultValue
    };
  }

  parseFunction(isAsync = false) {
    if (isAsync) {
      this.consume(TokenType.KEYWORD, "Expected 'async'", 'async');
    }
    this.consume(TokenType.KEYWORD, "Expected 'function'", 'function');
    const name = this.consume(TokenType.IDENTIFIER, 'Expected function name').value;
    this.consume(TokenType.PUNCTUATION, "Expected '('", '(');
    const params = [];
    while (!this.check(TokenType.PUNCTUATION, ')')) {
      params.push(this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value);
      if (this.check(TokenType.PUNCTUATION, ',')) this.advance();
    }
    this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');

    const body = this.parseStatements();

    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');

    return {
      type: ASTType.FUNCTION_DECLARATION,
      name,
      params,
      async: isAsync,
      body
    };
  }

  parseLifecycleHook() {
    const hookName = this.advance().value; // onMount | onDestroy | onUpdate
    this.consume(TokenType.PUNCTUATION, `Expected '{' after ${hookName}`, '{');
    const body = this.parseStatements();
    this.consume(TokenType.PUNCTUATION, `Expected '}' after ${hookName} body`, '}');
    return { type: ASTType.LIFECYCLE_HOOK, hookName, body };
  }

  parseComputedProp() {
    this.consume(TokenType.KEYWORD, "Expected 'computed'", 'computed');
    const name = this.consume(TokenType.IDENTIFIER, 'Expected computed property name').value;
    this.consume(TokenType.OPERATOR, "Expected '='", '=');
    const expression = this.parseExpression();
    return { type: ASTType.COMPUTED_PROP, name, expression };
  }

  parseWatcher() {
    this.consume(TokenType.KEYWORD, "Expected 'watch'", 'watch');
    const target = this.consume(TokenType.IDENTIFIER, 'Expected watched variable name').value;
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
    const body = this.parseStatements();
    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
    return { type: ASTType.WATCHER, target, body };
  }

  parseRouteDecl() {
    this.consume(TokenType.KEYWORD, "Expected 'route'", 'route');
    const name = this.consume(TokenType.IDENTIFIER, 'Expected route variable name').value;
    this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
    const valueType = this.consume(TokenType.IDENTIFIER, 'Expected type').value;
    return { type: ASTType.ROUTE_DECLARATION, name, valueType };
  }

  parseStore() {
    this.consume(TokenType.KEYWORD, "Expected 'store'", 'store');
    const name = this.consume(TokenType.IDENTIFIER, 'Expected store name').value;
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
    const fields = [];
    while (!this.check(TokenType.PUNCTUATION, '}') && !this.isAtEnd()) {
      const fieldName = this.consume(TokenType.IDENTIFIER, 'Expected field name').value;
      this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
      const fieldType = this.consume(TokenType.IDENTIFIER, 'Expected field type').value;
      let defaultValue = null;
      if (this.check(TokenType.OPERATOR, '=')) {
        this.advance();
        defaultValue = this.parseExpression();
      }
      fields.push({ name: fieldName, type: fieldType, defaultValue });
    }
    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
    return { type: ASTType.STORE_DECL, name, fields, exported: false };
  }

  // --- Statement Parsing (function / lifecycle bodies) ---

  parseStatements() {
    const stmts = [];
    while (!this.check(TokenType.PUNCTUATION, '}') && !this.isAtEnd()) {
      stmts.push(this.parseStatement());
    }
    return stmts;
  }

  parseStatement() {
    const token = this.peek();

    if (token.type === TokenType.KEYWORD && token.value === 'if') {
      return this.parseIfStatement();
    }

    if (token.type === TokenType.KEYWORD && token.value === 'try') {
      return this.parseTryCatch();
    }

    if (token.type === TokenType.KEYWORD && token.value === 'throw') {
      this.advance();
      const value = this.parseExpression();
      return { type: ASTType.THROW_STMT, value };
    }

    if (token.type === TokenType.KEYWORD && token.value === 'switch') {
      return this.parseSwitchStatement();
    }

    if (token.type === TokenType.KEYWORD && token.value === 'while') {
      return this.parseWhileStatement();
    }

    if (token.type === TokenType.KEYWORD && token.value === 'for') {
      return this.parseForStatement();
    }

    if (token.type === TokenType.KEYWORD && token.value === 'break') {
      this.advance();
      return { type: ASTType.BREAK_STMT };
    }

    if (token.type === TokenType.KEYWORD && token.value === 'continue') {
      this.advance();
      return { type: ASTType.CONTINUE_STMT };
    }

    if (token.type === TokenType.KEYWORD && token.value === 'return') {
      this.advance();
      // Bare `return` — no expression follows (next token closes a block)
      const next = this.peek();
      const hasValue = !(
        next.type === TokenType.PUNCTUATION && (next.value === '}' || next.value === ')' || next.value === ']')
      );
      const value = hasValue ? this.parseExpression() : { type: ASTType.LITERAL, value: null };
      return { type: ASTType.RETURN_STMT, value };
    }

    // emit eventName(args)
    if (token.type === TokenType.KEYWORD && token.value === 'emit') {
      this.advance();
      const eventName = this.consume(TokenType.IDENTIFIER, 'Expected event name after emit').value;
      this.consume(TokenType.PUNCTUATION, "Expected '('", '(');
      const args = [];
      while (!this.check(TokenType.PUNCTUATION, ')')) {
        args.push(this.parseExpression());
        if (this.check(TokenType.PUNCTUATION, ',')) this.advance();
      }
      this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
      return { type: ASTType.EMIT_STMT, eventName, args };
    }

    // Peek ahead: identifier followed by '=' (not '==' or '=>') → assignment
    // Also handles member assignment: Foo.bar = expr  or  Foo.bar.baz = expr
    if (token.type === TokenType.IDENTIFIER) {
      if (this._isMemberAssignment()) {
        return this.parseMemberAssignment();
      }
      const next = this.peekAt(1);
      if (next && next.type === TokenType.OPERATOR && next.value === '=') {
        const target = this.advance().value;
        this.advance(); // consume '='
        const value = this.parseExpression();
        return { type: ASTType.ASSIGNMENT_STMT, target, value };
      }
    }

    // Expression statement (function calls, etc.)
    const expr = this.parseExpression();
    return { type: ASTType.EXPR_STMT, expression: expr };
  }

  // Returns true if current position looks like Foo.bar = (member assignment)
  _isMemberAssignment() {
    let offset = 1;
    // Must start with IDENTIFIER . IDENTIFIER (at least one dot)
    const first = this.peekAt(offset);
    if (!first || first.type !== TokenType.PUNCTUATION || first.value !== '.') return false;
    // Walk any chain of . IDENTIFIER
    offset++;
    while (true) {
      const id = this.peekAt(offset);
      if (!id || id.type !== TokenType.IDENTIFIER) return false;
      offset++;
      const next = this.peekAt(offset);
      if (!next) return false;
      if (next.type === TokenType.OPERATOR && next.value === '=') return true;
      if (next.type === TokenType.PUNCTUATION && next.value === '.') { offset++; continue; }
      return false;
    }
  }

  parseMemberAssignment() {
    let obj = { type: ASTType.IDENTIFIER, name: this.advance().value };
    while (this.check(TokenType.PUNCTUATION, '.')) {
      this.advance(); // consume '.'
      const prop = this.consume(TokenType.IDENTIFIER, 'Expected property name').value;
      obj = { type: ASTType.MEMBER_EXPR, object: obj, property: prop, computed: false };
    }
    this.consume(TokenType.OPERATOR, "Expected '='", '=');
    const value = this.parseExpression();
    return { type: ASTType.MEMBER_ASSIGN_STMT, target: obj, value };
  }

  parseIfStatement() {
    this.consume(TokenType.KEYWORD, "Expected 'if'", 'if');
    this.consume(TokenType.PUNCTUATION, "Expected '('", '(');
    const condition = this.parseExpression();
    this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
    const consequent = this.parseStatements();
    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');

    let alternate = null;
    if (this.check(TokenType.KEYWORD, 'else')) {
      this.advance();
      if (this.check(TokenType.KEYWORD, 'if')) {
        alternate = [this.parseIfStatement()];
      } else {
        this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
        alternate = this.parseStatements();
        this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
      }
    }

    return { type: ASTType.IF_STMT, condition, consequent, alternate };
  }

  // --- New Statement Parsers ---

  parseTryCatch() {
    this.consume(TokenType.KEYWORD, "Expected 'try'", 'try');
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
    const tryBody = this.parseStatements();
    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');

    let catchParam = null;
    let catchBody = [];
    let finallyBody = null;

    if (this.check(TokenType.KEYWORD, 'catch')) {
      this.advance();
      this.consume(TokenType.PUNCTUATION, "Expected '('", '(');
      catchParam = this.consume(TokenType.IDENTIFIER, 'Expected catch parameter name').value;
      this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
      this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
      catchBody = this.parseStatements();
      this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
    }

    if (this.check(TokenType.KEYWORD, 'finally')) {
      this.advance();
      this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
      finallyBody = this.parseStatements();
      this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
    }

    return { type: ASTType.TRY_STMT, tryBody, catchParam, catchBody, finallyBody };
  }

  parseSwitchStatement() {
    this.consume(TokenType.KEYWORD, "Expected 'switch'", 'switch');
    this.consume(TokenType.PUNCTUATION, "Expected '('", '(');
    const discriminant = this.parseExpression();
    this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');

    const cases = [];
    while (!this.check(TokenType.PUNCTUATION, '}') && !this.isAtEnd()) {
      if (this.check(TokenType.KEYWORD, 'case')) {
        this.advance();
        const test = this.parseExpression();
        this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
        const body = this._parseSwitchCaseBody();
        cases.push({ test, body });
      } else if (this.check(TokenType.KEYWORD, 'default')) {
        this.advance();
        this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
        const body = this._parseSwitchCaseBody();
        cases.push({ test: null, body });
      } else {
        throw new Error(`Expected 'case' or 'default' in switch, got '${this.peek().value}' at line ${this.peek().line}`);
      }
    }

    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
    return { type: ASTType.SWITCH_STMT, discriminant, cases };
  }

  _parseSwitchCaseBody() {
    const stmts = [];
    while (
      !this.check(TokenType.PUNCTUATION, '}') &&
      !this.check(TokenType.KEYWORD, 'case') &&
      !this.check(TokenType.KEYWORD, 'default') &&
      !this.isAtEnd()
    ) {
      stmts.push(this.parseStatement());
    }
    return stmts;
  }

  parseWhileStatement() {
    this.consume(TokenType.KEYWORD, "Expected 'while'", 'while');
    this.consume(TokenType.PUNCTUATION, "Expected '('", '(');
    const condition = this.parseExpression();
    this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
    const body = this.parseStatements();
    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
    return { type: ASTType.WHILE_STMT, condition, body };
  }

  parseForStatement() {
    this.consume(TokenType.KEYWORD, "Expected 'for'", 'for');
    this.consume(TokenType.PUNCTUATION, "Expected '('", '(');

    const first = this.peek();
    const second = this.peekAt(1);

    // for (item in list) — for-in loop
    if (first.type === TokenType.IDENTIFIER &&
        second && second.type === TokenType.KEYWORD && second.value === 'in') {
      const item = this.advance().value;
      this.advance(); // consume 'in'
      const listExpr = this.parseExpression();
      this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
      this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
      const body = this.parseStatements();
      this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
      return { type: ASTType.FOR_IN_STMT, item, listExpr, body };
    }

    // for (i = 0; i < n; i = i + 1) — classic C-style loop
    const initVar = this.consume(TokenType.IDENTIFIER, 'Expected loop variable').value;
    this.consume(TokenType.OPERATOR, "Expected '='", '=');
    const initExpr = this.parseExpression();
    this.consume(TokenType.PUNCTUATION, "Expected ';'", ';');
    const condition = this.parseExpression();
    this.consume(TokenType.PUNCTUATION, "Expected ';'", ';');
    const updateVar = this.consume(TokenType.IDENTIFIER, 'Expected update variable').value;
    this.consume(TokenType.OPERATOR, "Expected '='", '=');
    const updateExpr = this.parseExpression();
    this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
    const body = this.parseStatements();
    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
    return { type: ASTType.FOR_CLASSIC, initVar, initExpr, condition, updateVar, updateExpr, body };
  }

  // --- Top-level Declaration Parsers ---

  parseEnum() {
    this.consume(TokenType.KEYWORD, "Expected 'enum'", 'enum');
    const name = this.consume(TokenType.IDENTIFIER, 'Expected enum name').value;
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
    const values = [];
    while (!this.check(TokenType.PUNCTUATION, '}') && !this.isAtEnd()) {
      values.push(this.consume(TokenType.IDENTIFIER, 'Expected enum value').value);
    }
    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
    return { type: ASTType.ENUM_DECL, name, values, exported: false };
  }

  parseModel() {
    this.consume(TokenType.KEYWORD, "Expected 'model'", 'model');
    const name = this.consume(TokenType.IDENTIFIER, 'Expected model name').value;
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
    const fields = [];
    while (!this.check(TokenType.PUNCTUATION, '}') && !this.isAtEnd()) {
      const fieldName = this.consume(TokenType.IDENTIFIER, 'Expected field name').value;
      this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
      const fieldType = this.consume(TokenType.IDENTIFIER, 'Expected field type').value;
      fields.push({ name: fieldName, type: fieldType });
    }
    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
    return { type: ASTType.MODEL_DECL, name, fields, exported: false };
  }

  // --- View-level switch ---

  parseViewSwitch() {
    this.consume(TokenType.KEYWORD, "Expected 'switch'", 'switch');
    this.consume(TokenType.PUNCTUATION, "Expected '('", '(');
    const discriminant = this.parseExpression();
    this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');

    const cases = [];
    while (!this.check(TokenType.PUNCTUATION, '}') && !this.isAtEnd()) {
      if (this.check(TokenType.KEYWORD, 'case')) {
        this.advance();
        const test = this.parseExpression();
        this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
        const children = this._parseViewSwitchCaseChildren();
        cases.push({ test, children });
      } else if (this.check(TokenType.KEYWORD, 'default')) {
        this.advance();
        this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
        const children = this._parseViewSwitchCaseChildren();
        cases.push({ test: null, children });
      } else {
        throw new Error(`Expected 'case' or 'default' in switch, got '${this.peek().value}' at line ${this.peek().line}`);
      }
    }

    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
    return { type: ASTType.VIEW_SWITCH, discriminant, cases };
  }

  _parseViewSwitchCaseChildren() {
    const children = [];
    while (
      !this.check(TokenType.PUNCTUATION, '}') &&
      !this.check(TokenType.KEYWORD, 'case') &&
      !this.check(TokenType.KEYWORD, 'default') &&
      !this.isAtEnd()
    ) {
      const token = this.peek();
      if (token.type === TokenType.KEYWORD && token.value === 'if') {
        children.push(this.parseConditional());
      } else if (token.type === TokenType.KEYWORD && token.value === 'for') {
        children.push(this.parseLoop());
      } else if (token.type === TokenType.KEYWORD && token.value === 'switch') {
        children.push(this.parseViewSwitch());
      } else if (token.type === TokenType.IDENTIFIER) {
        children.push(this.parseElement());
      } else {
        throw new Error(`Unexpected token in switch case: '${token.value}' at line ${token.line}`);
      }
    }
    return children;
  }

  // --- View Parsing ---

  parseView() {
    this.consume(TokenType.KEYWORD, "Expected 'view'", 'view');
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');

    const root = this.parseElement();

    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');

    return {
      type: ASTType.VIEW_DECLARATION,
      root
    };
  }

  parseElement() {
    const tagName = this.consume(TokenType.IDENTIFIER, 'Expected element tag name').value;
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');

    const element = {
      type: ASTType.ELEMENT,
      tagName,
      styles: [],
      attributes: [],
      events: [],
      children: []
    };

    while (!this.check(TokenType.PUNCTUATION, '}')) {
      const token = this.peek();

      if (token.type === TokenType.KEYWORD && token.value === 'style') {
        element.styles.push(this.parseStyle());
      } else if (token.type === TokenType.KEYWORD && token.value === 'if') {
        element.children.push(this.parseConditional());
      } else if (token.type === TokenType.KEYWORD && token.value === 'for') {
        element.children.push(this.parseLoop());
      } else if (token.type === TokenType.KEYWORD && token.value === 'switch') {
        element.children.push(this.parseViewSwitch());
      } else if (token.type === TokenType.KEYWORD && token.value === 'bind') {
        element.attributes.push(this.parseBind());
      } else if (token.type === TokenType.IDENTIFIER && token.value.startsWith('@')) {
        const eventName = this.consume(TokenType.IDENTIFIER).value.substring(1);
        this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
        const handlerExpr = this.parseExpression();
        const isComponent = /^[A-Z]/.test(tagName);
        element.events.push({
          type: ASTType.EVENT_HANDLER,
          event: eventName,
          handler: handlerExpr,
          isComponentEvent: isComponent
        });
      } else if (token.type === TokenType.IDENTIFIER && this.isAttribute(token)) {
        const name = this.consume(TokenType.IDENTIFIER).value;
        this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
        const value = this.parseExpression();
        element.attributes.push({
          type: ASTType.ATTRIBUTE,
          name,
          value
        });
      } else if (token.type === TokenType.IDENTIFIER) {
        element.children.push(this.parseElement());
      } else {
        throw new Error(`Unexpected token in element: '${token.value}' at line ${token.line}`);
      }
    }

    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
    return element;
  }

  parseConditional() {
    this.consume(TokenType.KEYWORD, "Expected 'if'", 'if');
    this.consume(TokenType.PUNCTUATION, "Expected '('", '(');
    const condition = this.parseExpression();
    this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');

    const consequent = this.parseChildBlock();
    let alternate = null;

    if (this.check(TokenType.KEYWORD, 'else')) {
      this.advance();
      if (this.check(TokenType.KEYWORD, 'if')) {
        // else if — wrap the nested conditional so compileConditional can detect it
        alternate = [this.parseConditional()];
      } else {
        alternate = this.parseChildBlock();
      }
    }

    return {
      type: ASTType.CONDITIONAL,
      condition,
      consequent,
      alternate
    };
  }

  parseLoop() {
    this.consume(TokenType.KEYWORD, "Expected 'for'", 'for');
    this.consume(TokenType.PUNCTUATION, "Expected '('", '(');

    const item = this.consume(TokenType.IDENTIFIER, 'Expected loop variable').value;
    this.consume(TokenType.KEYWORD, "Expected 'in'", 'in');
    const list = this.consume(TokenType.IDENTIFIER, 'Expected list variable').value;

    this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');

    const body = this.parseChildBlock();

    return {
      type: ASTType.LOOP,
      item,
      list,
      body
    };
  }

  parseChildBlock() {
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
    const children = [];

    while (!this.check(TokenType.PUNCTUATION, '}')) {
      const token = this.peek();

      if (token.type === TokenType.KEYWORD && token.value === 'if') {
        children.push(this.parseConditional());
      } else if (token.type === TokenType.KEYWORD && token.value === 'for') {
        children.push(this.parseLoop());
      } else if (token.type === TokenType.KEYWORD && token.value === 'switch') {
        children.push(this.parseViewSwitch());
      } else if (token.type === TokenType.IDENTIFIER) {
        children.push(this.parseElement());
      } else {
        throw new Error(`Unexpected token in block: '${token.value}'. Expected element, if, for, or switch.`);
      }
    }

    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
    return children;
  }

  isAttribute(token) {
    const next = this.peekAt(1);
    return next && next.value === ':';
  }

  parseStyle() {
    this.consume(TokenType.KEYWORD, "Expected 'style'", 'style');
    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');

    const properties = [];

    while (!this.check(TokenType.PUNCTUATION, '}')) {
      const token = this.peek();
      if (token.type === TokenType.IDENTIFIER && token.value === '@media') {
        properties.push(this.parseMediaQuery());
      } else {
        properties.push(this._parseStyleProperty());
      }
    }

    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');

    return {
      type: ASTType.STYLE_BLOCK,
      properties
    };
  }

  _parseStyleProperty() {
    const CSS_UNITS = new Set([
      'px', 'em', 'rem', 'vh', 'vw', 'pt', 'pc', 'cm', 'mm',
      'ex', 'ch', 'fr', 'deg', 'rad', 's', 'ms', 'vmin', 'vmax'
    ]);

    const name = this.consume(TokenType.IDENTIFIER, 'Expected style property').value;
    this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');

    let valueExpr;
    const token = this.peek();

    if (token.type === TokenType.NUMBER) {
      const numToken = this.advance();
      let valStr = String(numToken.value);
      if (this.peek().type === TokenType.IDENTIFIER && CSS_UNITS.has(this.peek().value)) {
        valStr += this.advance().value;
      }
      valueExpr = { type: ASTType.LITERAL, value: valStr };
    } else {
      valueExpr = this.parseExpression();
    }

    return { type: ASTType.STYLE_PROPERTY, name, value: valueExpr };
  }

  parseMediaQuery() {
    this.consume(TokenType.IDENTIFIER, "Expected '@media'", '@media');
    this.consume(TokenType.PUNCTUATION, "Expected '('", '(');

    // Collect tokens inside the parentheses to reconstruct the query string
    const parts = [];
    while (!this.check(TokenType.PUNCTUATION, ')')) {
      parts.push(this.advance());
    }
    this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');

    const query = `(${this._reconstructMediaQuery(parts)})`;

    this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');
    const properties = [];
    while (!this.check(TokenType.PUNCTUATION, '}')) {
      properties.push(this._parseStyleProperty());
    }
    this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');

    return { type: ASTType.MEDIA_QUERY, query, properties };
  }

  _reconstructMediaQuery(parts) {
    let result = '';
    for (let i = 0; i < parts.length; i++) {
      const tok = parts[i];
      const prev = i > 0 ? parts[i - 1] : null;

      if (i === 0) {
        result += String(tok.value);
      } else if (tok.value === ':') {
        // No space before colon: max-width: → max-width:
        result += ':';
      } else if (prev && prev.value === ':') {
        // Space after colon: :768 → : 768
        result += ' ' + String(tok.value);
      } else if (prev && prev.type === TokenType.NUMBER) {
        // Unit glued to number: 768 px → 768px
        result += String(tok.value);
      } else {
        result += ' ' + String(tok.value);
      }
    }
    return result;
  }

  parseBind() {
    this.consume(TokenType.KEYWORD, "Expected 'bind'", 'bind');
    const target = this.consume(TokenType.IDENTIFIER, 'Expected attribute to bind').value;
    this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
    const variable = this.consume(TokenType.IDENTIFIER, 'Expected state variable to bind').value;
    return {
      type: ASTType.BIND_DIRECTIVE,
      name: target,
      value: { type: ASTType.IDENTIFIER, name: variable }
    };
  }

  // --- Pratt Expression Parser ---

  parseExpression(minPrec = 0) {
    let left = this.parsePrefix();

    while (true) {
      const token = this.peek();

      // Ternary: condition ? consequent : alternate
      if (minPrec < 1 && token.type === TokenType.OPERATOR && token.value === '?') {
        this.advance(); // consume '?'
        const consequent = this.parseExpression();
        this.consume(TokenType.PUNCTUATION, "Expected ':' in ternary", ':');
        const alternate = this.parseExpression();
        left = { type: ASTType.TERNARY_EXPR, condition: left, consequent, alternate };
        break;
      }

      // Member access: expr.prop (prop may be a keyword token like 'default', 'for', etc.)
      if (token.type === TokenType.PUNCTUATION && token.value === '.' && minPrec < 10) {
        this.advance(); // consume '.'
        const propTok = this.peek();
        if (propTok.type !== TokenType.IDENTIFIER && propTok.type !== TokenType.KEYWORD) {
          throw new Error(`Expected property name after .. Found ${propTok.type} '${propTok.value}' at line ${propTok.line}, column ${propTok.column}`);
        }
        this.advance();
        left = { type: ASTType.MEMBER_EXPR, object: left, property: propTok.value, computed: false };
        continue;
      }

      // Optional chaining: expr?.prop (prop may be a keyword token)
      if (token.type === TokenType.OPERATOR && token.value === '?.' && minPrec < 10) {
        this.advance(); // consume '?.'
        const propTok = this.peek();
        if (propTok.type !== TokenType.IDENTIFIER && propTok.type !== TokenType.KEYWORD) {
          throw new Error(`Expected property name after ?.. Found ${propTok.type} '${propTok.value}' at line ${propTok.line}, column ${propTok.column}`);
        }
        this.advance();
        left = { type: ASTType.OPTIONAL_CHAIN, object: left, property: propTok.value };
        continue;
      }

      // Function call: expr(args)
      if (token.type === TokenType.PUNCTUATION && token.value === '(' && minPrec < 10) {
        this.advance(); // consume '('
        const args = [];
        while (!this.check(TokenType.PUNCTUATION, ')')) {
          args.push(this.parseExpression());
          if (this.check(TokenType.PUNCTUATION, ',')) this.advance();
        }
        this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
        left = { type: ASTType.CALL_EXPR, callee: left, args };
        continue;
      }

      // Computed member access: expr[index]
      if (token.type === TokenType.PUNCTUATION && token.value === '[' && minPrec < 10) {
        this.advance(); // consume '['
        const index = this.parseExpression();
        this.consume(TokenType.PUNCTUATION, "Expected ']'", ']');
        left = { type: ASTType.MEMBER_EXPR, object: left, property: index, computed: true };
        continue;
      }

      // Binary infix operators
      const prec = token.type === TokenType.OPERATOR ? INFIX_PREC[token.value] : undefined;
      if (prec === undefined || prec <= minPrec) break;

      const op = this.advance().value;
      const right = this.parseExpression(prec);
      left = { type: ASTType.BINARY_EXPR, left, operator: op, right };
    }

    return left;
  }

  parsePrefix() {
    const token = this.peek();

    // Await expression
    if (token.type === TokenType.KEYWORD && token.value === 'await') {
      this.advance();
      const expression = this.parseExpression(8);
      return { type: ASTType.AWAIT_EXPR, expression };
    }

    // Unary operators
    if (token.type === TokenType.OPERATOR && (token.value === '!' || token.value === '-')) {
      const op = this.advance().value;
      const operand = this.parseExpression(8); // higher than any binary
      return { type: ASTType.UNARY_EXPR, operator: op, operand };
    }

    // Parenthesized expression
    if (token.type === TokenType.PUNCTUATION && token.value === '(') {
      this.advance();
      const expr = this.parseExpression();
      this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
      return expr;
    }

    // Array literal
    if (token.type === TokenType.PUNCTUATION && token.value === '[') {
      this.advance();
      const elements = [];
      while (!this.check(TokenType.PUNCTUATION, ']')) {
        elements.push(this.parseExpression());
        if (this.check(TokenType.PUNCTUATION, ',')) this.advance();
      }
      this.consume(TokenType.PUNCTUATION, "Expected ']'", ']');
      return { type: ASTType.ARRAY_LITERAL, elements };
    }

    // Object literal: { key: expr, ... }
    if (token.type === TokenType.PUNCTUATION && token.value === '{') {
      this.advance();
      const properties = [];
      while (!this.check(TokenType.PUNCTUATION, '}')) {
        let key;
        if (this.peek().type === TokenType.STRING) {
          key = this.advance().value;
        } else {
          key = this.consume(TokenType.IDENTIFIER, 'Expected object key').value;
        }
        this.consume(TokenType.PUNCTUATION, "Expected ':'", ':');
        const value = this.parseExpression();
        properties.push({ key, value });
        if (this.check(TokenType.PUNCTUATION, ',')) this.advance();
      }
      this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');
      return { type: ASTType.OBJECT_LITERAL, properties };
    }

    // Literals
    if (token.type === TokenType.STRING || token.type === TokenType.NUMBER || token.type === TokenType.BOOLEAN) {
      this.advance();
      return { type: ASTType.LITERAL, value: token.value };
    }

    // null keyword as literal
    if (token.type === TokenType.KEYWORD && token.value === 'null') {
      this.advance();
      return { type: ASTType.LITERAL, value: null };
    }

    // new ClassName(args)
    if (token.type === TokenType.KEYWORD && token.value === 'new') {
      this.advance();
      const classTok = this.consume(TokenType.IDENTIFIER, 'Expected class name after new');
      let callee = { type: ASTType.IDENTIFIER, name: classTok.value };
      // Allow chained member access for namespaced constructors (e.g. new a.B())
      while (this.check(TokenType.PUNCTUATION, '.')) {
        this.advance();
        const prop = this.advance();
        callee = { type: ASTType.MEMBER_EXPR, object: callee, property: prop.value, computed: false };
      }
      const args = [];
      if (this.check(TokenType.PUNCTUATION, '(')) {
        this.advance();
        while (!this.check(TokenType.PUNCTUATION, ')')) {
          args.push(this.parseExpression());
          if (this.check(TokenType.PUNCTUATION, ',')) this.advance();
        }
        this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
      }
      return { type: ASTType.NEW_EXPR, callee, args };
    }

    // Identifiers
    if (token.type === TokenType.IDENTIFIER) {
      this.advance();
      return { type: ASTType.IDENTIFIER, name: token.value };
    }

    throw new Error(`Unexpected token in expression: '${token.value}' at line ${token.line}, column ${token.column}`);
  }
}

module.exports = { Parser };
