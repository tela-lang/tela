const { Parser } = require('./parser');
const { ASTType } = require('./ast-types');
const { TokenType } = require('./token-types');

class Compiler {
  constructor() {
    this.stateVariables = new Set();
    this.propVariables = new Set();
    this.computedVariables = new Set();
    this.propDefaults = new Map();
    this.cssRules = [];
    this.uniqueIdCounter = 0;
  }

  compile(source) {
    const parser = new Parser(source);
    const ast = parser.parse();
    this.cssRules = [];
    this.uniqueIdCounter = 0;

    const importLines = (ast.imports || []).map(imp => {
      const jsPath = imp.path.replace(/\.tela$/, '.js');
      return `import { ${imp.name} } from '${jsPath}';`;
    }).join('\n');

    const enumLines = (ast.enums || []).map(e => this.compileEnum(e)).join('\n');
    const modelLines = (ast.models || []).map(m => this.compileModel(m)).join('\n');
    const storeNames = new Set((ast.stores || []).map(s => s.name));
    const storeLines = (ast.stores || []).map(s => this.compileStore(s)).join('\n');
    const js = ast.components.map(component => this.compileComponent(component, storeNames)).join('\n\n');

    const parts = [importLines, enumLines, modelLines, storeLines, js].filter(Boolean);
    const output = parts.join('\n\n');

    return {
      js: output,
      css: this.cssRules.join('\n')
    };
  }

  compileEnum(enumDecl) {
    const entries = enumDecl.values.map(v => `${v}: '${v}'`).join(', ');
    const decl = `const ${enumDecl.name} = Object.freeze({ ${entries} });`;
    return enumDecl.exported ? `export ${decl}` : decl;
  }

  compileModel(modelDecl) {
    const fields = modelDecl.fields.map(f => `${f.name}: data.${f.name}`).join(', ');
    const decl = `const ${modelDecl.name} = (data) => ({ ${fields} });`;
    return modelDecl.exported ? `export ${decl}` : decl;
  }

  compileStore(storeDecl) {
    const fields = storeDecl.fields.map(f => {
      const val = f.defaultValue
        ? this.compileExpression(f.defaultValue, new Set(), '')
        : 'null';
      return `${f.name}: ${val}`;
    }).join(', ');
    const decl = `const ${storeDecl.name} = Tela.store('${storeDecl.name}', { ${fields} });`;
    return storeDecl.exported ? `export ${decl}` : decl;
  }

  compileComponent(component, knownStoreNames = new Set()) {
    this.stateVariables.clear();
    this.propVariables.clear();
    this.computedVariables.clear();
    this.propDefaults.clear();

    component.state.forEach(s => this.stateVariables.add(s.name));
    component.props.forEach(p => {
      this.propVariables.add(p.name);
      if (p.defaultValue) {
        const compiled = this.compileExpression(p.defaultValue, new Set(), component.name);
        this.propDefaults.set(p.name, compiled);
      }
    });
    (component.computed || []).forEach(c => this.computedVariables.add(c.name));
    // Route vars are plain let variables (NOT reactive) so path+params update atomically
    // before a single instance.update() call. Do NOT add them to stateVariables.

    // Route setup: detect path (String) and params (Object) route vars
    const routes = component.routes || [];
    const pathRoute = routes.find(r => r.valueType === 'String');
    const paramsRoute = routes.find(r => r.valueType === 'Object');
    const routePatterns = pathRoute ? this._buildRoutePatterns(component) : [];
    const patternsJson = JSON.stringify(routePatterns);

    const stateInit = component.state.map(s => {
      const value = s.defaultValue
        ? this.compileExpression(s.defaultValue, new Set(), component.name)
        : 'null';
      return `${s.name}: ${value}`;
    }).join(',\n      ');

    const functions = component.functions
      .map(fn => this.compileFunction(fn, component.name))
      .join('\n\n    ');

    // Routing setup: plain let vars (not reactive) + navigate() + popstate listener + cleanup
    // Route vars are plain lets so path+params update atomically; one instance.update() fires.
    const userFunctionNames = new Set((component.functions || []).map(f => f.name));
    let routeVarDecls = '';
    let routeSetup = '';
    // Auto-inject a simple navigate() for components with no route declarations
    let universalNavigate = '';
    if (routes.length === 0 && !userFunctionNames.has('navigate')) {
      universalNavigate = `const navigate = (dest) => {\n      window.history.pushState(null, '', dest);\n      window.dispatchEvent(new PopStateEvent('popstate'));\n    };`;
    }
    if (routes.length > 0 && pathRoute) {
      // Declare route vars as plain let (NOT part of Tela.reactive)
      const initPath = routePatterns.length > 0
        ? `Tela.matchRoute(${patternsJson}, window.location.pathname).pattern`
        : `window.location.pathname`;
      const initParams = paramsRoute
        ? `Tela.matchRoute(${patternsJson}, window.location.pathname).params`
        : null;

      routeVarDecls = `let ${pathRoute.name} = ${initPath};` +
        (initParams ? `\n    let ${paramsRoute.name} = ${initParams};` : '');

      const pathVar = pathRoute.name;
      const paramsVar = paramsRoute ? paramsRoute.name : null;
      const hasPatterns = routePatterns.length > 0;

      const updateRouteVars = hasPatterns
        ? [
            `const _rm = Tela.matchRoute(${patternsJson}, dest);`,
            `${pathVar} = _rm.pattern;`,
            paramsVar ? `${paramsVar} = _rm.params;` : ''
          ].filter(Boolean).join('\n      ')
        : `${pathVar} = dest;`;

      const popstateUpdate = hasPatterns
        ? [
            `const _rm = Tela.matchRoute(${patternsJson}, window.location.pathname);`,
            `${pathVar} = _rm.pattern;`,
            paramsVar ? `${paramsVar} = _rm.params;` : ''
          ].filter(Boolean).join('\n      ')
        : `${pathVar} = window.location.pathname;`;

      const navigateFn = userFunctionNames.has('navigate') ? '' :
        `const navigate = (dest) => {\n      window.history.pushState(null, '', dest);\n      ${updateRouteVars}\n      instance.update();\n    };`;

      routeSetup = [
        navigateFn,
        `const _onPopState_${pathRoute.name} = () => { ${popstateUpdate} instance.update(); };`,
        `window.addEventListener('popstate', _onPopState_${pathRoute.name});`,
        `const _routeCleanup_${pathRoute.name} = () => { window.removeEventListener('popstate', _onPopState_${pathRoute.name}); };`
      ].filter(Boolean).join('\n    ');
    }

    // Lifecycle hooks
    // onMount runs inline in setup() so it has closure access to state/functions.
    // onUpdate/onDestroy remain as component properties (called by the runtime).
    const onMountHook = (component.lifecycleHooks || []).find(h => h.hookName === 'onMount');
    const onMountInline = onMountHook
      ? `// onMount\n    ${this.compileStatements(onMountHook.body, component.name)}`
      : '';

    const otherHooks = (component.lifecycleHooks || []).filter(h => h.hookName !== 'onMount');

    // Append route cleanup to onDestroy if there are route declarations
    const routeCleanupCalls = pathRoute
      ? `_routeCleanup_${pathRoute.name}();`
      : '';

    // Store subscriptions (must be computed before lifecycleProps)
    const referencedStores = this._collectStoreRefs(component, knownStoreNames);
    const storeSubscriptions = referencedStores.map(s =>
      `Tela.subscribeStore('${s}', instance.update);`
    ).join('\n    ');
    const storeUnsubscriptions = referencedStores.map(s =>
      `Tela.unsubscribeStore('${s}', instance.update);`
    ).join('\n      ');

    const lifecycleProps = otherHooks.map(hook => {
      let body = this.compileStatements(hook.body, component.name);
      if (hook.hookName === 'onDestroy') {
        if (routeCleanupCalls) body = `${body}\n      ${routeCleanupCalls}`;
        if (storeUnsubscriptions) body = `${body}\n      ${storeUnsubscriptions}`;
      }
      return `${hook.hookName}: function() {\n      ${body}\n    }`;
    });

    // If there are routes or store refs but no onDestroy hook, emit one for cleanup
    const hasOnDestroy = otherHooks.some(h => h.hookName === 'onDestroy');
    const needsOnDestroy = (routeCleanupCalls || storeUnsubscriptions) && !hasOnDestroy;
    if (needsOnDestroy) {
      const cleanupBody = [routeCleanupCalls, storeUnsubscriptions].filter(Boolean).join('\n      ');
      lifecycleProps.push(`onDestroy: function() {\n      ${cleanupBody}\n    }`);
    }

    const lifecyclePropsStr = lifecycleProps.join(',\n    ');

    // Computed properties
    const computedGetters = (component.computed || []).map(cp => {
      const expr = this.compileExpression(cp.expression, new Set(), component.name);
      return `get ${cp.name}() { return ${expr}; }`;
    }).join(',\n        ');

    // Watchers
    const watcherEntries = (component.watchers || []).map(w => {
      const body = this.compileStatements(w.body, component.name);
      return `${w.target}: function() {\n        ${body}\n      }`;
    }).join(',\n      ');

    const render = this.compileView(component.view, component.name);

    const computedBlock = computedGetters
      ? `const computed_${component.name} = {\n        ${computedGetters}\n      };`
      : '';

    const watchersBlock = watcherEntries
      ? `watchers: {\n      ${watcherEntries}\n    },`
      : '';

    const lifecycleBlock = lifecyclePropsStr
      ? `${lifecyclePropsStr},`
      : '';

    const exportKeyword = component.exported ? 'export ' : '';

    return `
${exportKeyword}const ${component.name} = Tela.defineComponent({
  name: '${component.name}',
  ${lifecycleBlock}
  ${watchersBlock}
  setup(instance) {
    const state_${component.name} = Tela.reactive({
      ${stateInit}
    }, instance.update, ${watcherEntries ? `{ ${watcherEntries} }` : '{}'});

    ${routeVarDecls}

    ${routeSetup}

    ${universalNavigate}

    ${storeSubscriptions}

    ${computedBlock}

    ${functions}

    ${onMountInline}

    return () => {
      ${computedGetters ? `const computed_${component.name} = { ${computedGetters} };` : ''}
      return ${render};
    };
  }
});
`;
  }

  compileFunction(fn, componentName) {
    // Params are pre-declared locals — don't emit `let` for them
    const localVars = new Set(fn.params || []);
    const body = this.compileStatements(fn.body, componentName, localVars);
    const asyncKeyword = fn.async ? 'async ' : '';
    const paramList = (fn.params || []).join(', ');
    return `const ${fn.name} = ${asyncKeyword}(${paramList}) => {\n      ${body}\n    };`;
  }

  compileStatements(stmts, componentName, localVars = new Set()) {
    return stmts.map(s => this.compileStatement(s, componentName, localVars)).join('\n      ');
  }

  compileStatement(stmt, componentName, localVars = new Set()) {
    switch (stmt.type) {
      case ASTType.ASSIGNMENT_STMT: {
        const value = this.compileExpression(stmt.value, localVars, componentName);
        if (this.stateVariables.has(stmt.target)) {
          return `state_${componentName}.${stmt.target} = ${value};`;
        }
        // Local variable: emit `let` on first assignment, plain assignment after
        if (!localVars.has(stmt.target)) {
          localVars.add(stmt.target);
          return `let ${stmt.target} = ${value};`;
        }
        return `${stmt.target} = ${value};`;
      }
      case ASTType.IF_STMT: {
        const cond = this.compileExpression(stmt.condition, new Set(), componentName);
        const cons = this.compileStatements(stmt.consequent, componentName, localVars);
        let alt = '';
        if (stmt.alternate) {
          if (stmt.alternate.length === 1 && stmt.alternate[0].type === ASTType.IF_STMT) {
            alt = ` else ${this.compileStatement(stmt.alternate[0], componentName, localVars)}`;
          } else {
            alt = ` else {\n        ${this.compileStatements(stmt.alternate, componentName, localVars)}\n      }`;
          }
        }
        return `if (${cond}) {\n        ${cons}\n      }${alt}`;
      }
      case ASTType.EXPR_STMT:
        return `${this.compileExpression(stmt.expression, new Set(), componentName)};`;
      case ASTType.RETURN_STMT:
        return `return ${this.compileExpression(stmt.value, new Set(), componentName)};`;
      case ASTType.EMIT_STMT: {
        const propName = 'on' + stmt.eventName.charAt(0).toUpperCase() + stmt.eventName.slice(1);
        const args = stmt.args.map(a => this.compileExpression(a, new Set(), componentName)).join(', ');
        return `instance.props.${propName}?.(${args});`;
      }

      case ASTType.TRY_STMT: {
        const tryBody = this.compileStatements(stmt.tryBody, componentName, localVars);
        let out = `try {\n        ${tryBody}\n      }`;
        if (stmt.catchParam) {
          const catchLocals = new Set([...localVars, stmt.catchParam]);
          const catchBody = this.compileStatements(stmt.catchBody, componentName, catchLocals);
          out += ` catch (${stmt.catchParam}) {\n        ${catchBody}\n      }`;
        }
        if (stmt.finallyBody) {
          const finallyBody = this.compileStatements(stmt.finallyBody, componentName, localVars);
          out += ` finally {\n        ${finallyBody}\n      }`;
        }
        return out;
      }

      case ASTType.THROW_STMT: {
        const value = this.compileExpression(stmt.value, localVars, componentName);
        return `throw ${value};`;
      }

      case ASTType.SWITCH_STMT: {
        const disc = this.compileExpression(stmt.discriminant, localVars, componentName);
        const cases = stmt.cases.map(c => {
          const body = this.compileStatements(c.body, componentName, new Set([...localVars]));
          if (c.test === null) {
            return `default: {\n        ${body}\n        break;\n      }`;
          }
          const test = this.compileExpression(c.test, localVars, componentName);
          return `case ${test}: {\n        ${body}\n        break;\n      }`;
        }).join('\n      ');
        return `switch (${disc}) {\n      ${cases}\n    }`;
      }

      case ASTType.WHILE_STMT: {
        const cond = this.compileExpression(stmt.condition, localVars, componentName);
        const body = this.compileStatements(stmt.body, componentName, new Set([...localVars]));
        return `while (${cond}) {\n        ${body}\n      }`;
      }

      case ASTType.BREAK_STMT:
        return 'break;';

      case ASTType.CONTINUE_STMT:
        return 'continue;';

      case ASTType.FOR_IN_STMT: {
        const listExpr = this.compileExpression(stmt.listExpr, localVars, componentName);
        const innerLocals = new Set([...localVars, stmt.item]);
        const body = this.compileStatements(stmt.body, componentName, innerLocals);
        return `for (const ${stmt.item} of ${listExpr}) {\n        ${body}\n      }`;
      }

      case ASTType.FOR_CLASSIC: {
        const innerLocals = new Set([...localVars, stmt.initVar]);
        const init = `let ${stmt.initVar} = ${this.compileExpression(stmt.initExpr, localVars, componentName)}`;
        const cond = this.compileExpression(stmt.condition, innerLocals, componentName);
        const update = `${stmt.updateVar} = ${this.compileExpression(stmt.updateExpr, innerLocals, componentName)}`;
        const body = this.compileStatements(stmt.body, componentName, innerLocals);
        return `for (${init}; ${cond}; ${update}) {\n        ${body}\n      }`;
      }

      case ASTType.MEMBER_ASSIGN_STMT: {
        const target = this.compileExpression(stmt.target, localVars, componentName);
        const value = this.compileExpression(stmt.value, localVars, componentName);
        return `${target} = ${value};`;
      }

      default:
        return '';
    }
  }

  // Collect all store names referenced anywhere in the component
  _collectStoreRefs(component, storeNames) {
    if (storeNames.size === 0) return [];
    const found = new Set();
    const walkExpr = (node) => {
      if (!node || typeof node !== 'object') return;
      if (node.type === ASTType.IDENTIFIER && storeNames.has(node.name)) {
        found.add(node.name);
      }
      if (node.type === ASTType.MEMBER_EXPR) {
        // Check if root object is a store name
        let root = node;
        while (root.type === ASTType.MEMBER_EXPR) root = root.object;
        if (root.type === ASTType.IDENTIFIER && storeNames.has(root.name)) {
          found.add(root.name);
        }
      }
      for (const key of Object.keys(node)) {
        if (key === 'type') continue;
        const val = node[key];
        if (Array.isArray(val)) val.forEach(walkExpr);
        else if (val && typeof val === 'object') walkExpr(val);
      }
    };
    component.functions.forEach(fn => fn.body.forEach(walkExpr));
    (component.lifecycleHooks || []).forEach(h => h.body.forEach(walkExpr));
    (component.computed || []).forEach(c => walkExpr(c.expression));
    (component.watchers || []).forEach(w => w.body.forEach(walkExpr));
    if (component.view) walkExpr(component.view.root);
    return [...found];
  }

  // Extract route patterns from a view-level switch on the path variable
  _buildRoutePatterns(component) {
    if (!component.view) return [];
    const pathRoute = (component.routes || []).find(r => r.valueType === 'String');
    if (!pathRoute) return [];
    return this._findPatternsInChildren([component.view.root], pathRoute.name);
  }

  _findPatternsInChildren(nodes, varName) {
    const patterns = [];
    for (const node of nodes) {
      if (!node) continue;
      if (node.type === ASTType.VIEW_SWITCH) {
        const disc = node.discriminant;
        if (disc && disc.type === ASTType.IDENTIFIER && disc.name === varName) {
          for (const c of node.cases) {
            if (c.test && c.test.type === ASTType.LITERAL && typeof c.test.value === 'string') {
              patterns.push(c.test.value);
            }
          }
        }
      }
      if (node.children) patterns.push(...this._findPatternsInChildren(node.children, varName));
      if (node.consequent) patterns.push(...this._findPatternsInChildren(node.consequent, varName));
      if (node.alternate) patterns.push(...this._findPatternsInChildren(node.alternate, varName));
      if (node.cases) {
        for (const c of node.cases) {
          if (c.children) patterns.push(...this._findPatternsInChildren(c.children, varName));
        }
      }
    }
    return [...new Set(patterns)];
  }

  compileView(view, componentName) {
    if (!view) return 'null';
    return this.compileElement(view.root, new Set(), componentName);
  }

  compileElement(element, locals = new Set(), componentName) {
    const isComponent = /^[A-Z]/.test(element.tagName);
    const tag = isComponent ? element.tagName : `'${element.tagName}'`;

    const attrsObj = {};

    // Styles
    if (element.styles.length > 0) {
      const staticStyleProps = [];
      const dynamicStyleProps = [];
      const mediaQueries = [];

      element.styles.forEach(block => {
        block.properties.forEach(prop => {
          if (prop.type === ASTType.MEDIA_QUERY) {
            mediaQueries.push(prop);
          } else if (prop.value.type === ASTType.LITERAL) {
            staticStyleProps.push(`${prop.name}: ${prop.value.value}`);
          } else {
            const val = this.compileExpression(prop.value, locals, componentName);
            dynamicStyleProps.push(`'${prop.name}': ${val}`);
          }
        });
      });

      if (staticStyleProps.length > 0 || mediaQueries.length > 0) {
        const className = `tela-${componentName}-${element.tagName}-${this.uniqueIdCounter++}`;
        if (staticStyleProps.length > 0) {
          this.cssRules.push(`.${className} { ${staticStyleProps.join('; ')} }`);
        }
        mediaQueries.forEach(mq => {
          const mqProps = mq.properties
            .filter(p => p.value.type === ASTType.LITERAL)
            .map(p => `${p.name}: ${p.value.value}`)
            .join('; ');
          if (mqProps) {
            this.cssRules.push(`@media ${mq.query} { .${className} { ${mqProps} } }`);
          }
        });
        attrsObj['class'] = `"${className}"`;
      }

      if (dynamicStyleProps.length > 0) {
        attrsObj['style'] = `{ ${dynamicStyleProps.join(', ')} }`;
      }
    }

    // Explicit Attributes
    element.attributes.forEach(attr => {
      if (attr.type === ASTType.BIND_DIRECTIVE) {
        const boundExpr = this.compileExpression(attr.value, locals, componentName);
        attrsObj[attr.name] = boundExpr;
        if (attr.name === 'value') {
          attrsObj['oninput'] = `(e => { ${boundExpr} = e.target.value })`;
        }
      } else {
        attrsObj[attr.name] = this.compileExpression(attr.value, locals, componentName);
      }
    });

    // Events
    // Standard DOM events stay lowercase (onclick, oninput, etc.)
    // Custom component events (non-DOM) get capitalized (onCountChange)
    const DOM_EVENTS = new Set([
      'click', 'input', 'change', 'submit', 'focus', 'blur', 'reset',
      'keydown', 'keyup', 'keypress', 'mouseenter', 'mouseleave',
      'mouseover', 'mouseout', 'mousemove', 'mousedown', 'mouseup',
      'scroll', 'resize', 'load', 'unload', 'error', 'touchstart',
      'touchend', 'touchmove', 'dblclick', 'contextmenu', 'wheel'
    ]);
    element.events.forEach(evt => {
      const handler = this._compileHandler(evt.handler, locals, componentName);
      if (evt.isComponentEvent && !DOM_EVENTS.has(evt.event)) {
        // Custom component event: @countChange → onCountChange prop
        const propName = 'on' + evt.event.charAt(0).toUpperCase() + evt.event.slice(1);
        attrsObj[propName] = handler;
      } else {
        // DOM event (or standard event on component): @click → onclick
        attrsObj[`on${evt.event}`] = handler;
      }
    });

    const attrsString = this.serializeObject(attrsObj);

    // Children
    const children = element.children.map(child => {
      if (child.type === ASTType.ELEMENT) {
        return this.compileElement(child, locals, componentName);
      }
      if (child.type === ASTType.CONDITIONAL) {
        return this.compileConditional(child, locals, componentName);
      }
      if (child.type === ASTType.LOOP) {
        return this.compileLoop(child, locals, componentName);
      }
      if (child.type === ASTType.VIEW_SWITCH) {
        return this.compileViewSwitch(child, locals, componentName);
      }
      return 'null';
    });

    // Content (Text)
    const contentAttr = element.attributes.find(a => a.name === 'content');
    if (contentAttr) {
      children.push(this.compileExpression(contentAttr.value, locals, componentName));
    }

    const childrenString = `[${children.join(', ')}]`;

    return `Tela.element(${tag}, ${attrsString}, ${childrenString})`;
  }

  compileExpression(expr, locals = new Set(), componentName) {
    if (!expr) return 'null';

    switch (expr.type) {
      case ASTType.ARRAY_LITERAL: {
        const elements = expr.elements
          .map(e => this.compileExpression(e, locals, componentName))
          .join(', ');
        return `[${elements}]`;
      }

      case ASTType.OBJECT_LITERAL: {
        const props = expr.properties
          .map(p => `'${p.key}': ${this.compileExpression(p.value, locals, componentName)}`)
          .join(', ');
        return `{ ${props} }`;
      }

      case ASTType.LITERAL: {
        if (typeof expr.value === 'string') {
          if (expr.value.includes('${')) {
            let val = expr.value;
            // Match ${varName followed by }, ., or [ so member chains work: ${owners.length}
            this.stateVariables.forEach(v => {
              const regex = new RegExp(`\\$\\{(${v})(?=[.\\[}])`, 'g');
              val = val.replace(regex, `\${state_${componentName}.$1`);
            });
            this.propVariables.forEach(v => {
              const def = this.propDefaults.get(v);
              const replacement = def !== undefined
                ? `\${(instance.props.$1 ?? ${def})`
                : `\${instance.props.$1`;
              const regex = new RegExp(`\\$\\{(${v})(?=[.\\[}])`, 'g');
              val = val.replace(regex, replacement);
            });
            this.computedVariables.forEach(v => {
              const regex = new RegExp(`\\$\\{(${v})(?=[.\\[}])`, 'g');
              val = val.replace(regex, `\${computed_${componentName}.$1`);
            });
            // locals (loop vars, params) are already in JS scope — no transformation needed
            return `\`${val}\``;
          }
          return `"${expr.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

        }
        if (expr.value === null) return 'null';
        return String(expr.value);
      }

      case ASTType.IDENTIFIER: {
        if (locals.has(expr.name)) return expr.name;
        if (this.stateVariables.has(expr.name)) {
          return `state_${componentName}.${expr.name}`;
        }
        if (this.propVariables.has(expr.name)) {
          const def = this.propDefaults.get(expr.name);
          if (def !== undefined) return `(instance.props.${expr.name} ?? ${def})`;
          return `instance.props.${expr.name}`;
        }
        if (this.computedVariables.has(expr.name)) {
          return `computed_${componentName}.${expr.name}`;
        }
        return expr.name;
      }

      case ASTType.BINARY_EXPR: {
        const l = this.compileExpression(expr.left, locals, componentName);
        const r = this.compileExpression(expr.right, locals, componentName);
        return `(${l} ${expr.operator} ${r})`;
      }

      case ASTType.UNARY_EXPR: {
        const operand = this.compileExpression(expr.operand, locals, componentName);
        return `(${expr.operator}${operand})`;
      }

      case ASTType.CALL_EXPR: {
        // For call expressions, the callee itself should NOT expand state vars as a member path
        // (e.g. `clearInterval(id)` — clearInterval stays as-is)
        const callee = this.compileExpression(expr.callee, locals, componentName);
        const args = expr.args
          .map(a => this.compileExpression(a, locals, componentName))
          .join(', ');
        return `${callee}(${args})`;
      }

      case ASTType.MEMBER_EXPR: {
        const obj = this.compileExpression(expr.object, locals, componentName);
        if (expr.computed) {
          const idx = this.compileExpression(expr.property, locals, componentName);
          return `${obj}[${idx}]`;
        }
        return `${obj}.${expr.property}`;
      }

      case ASTType.TERNARY_EXPR: {
        const cond = this.compileExpression(expr.condition, locals, componentName);
        const cons = this.compileExpression(expr.consequent, locals, componentName);
        const alt = this.compileExpression(expr.alternate, locals, componentName);
        return `(${cond} ? ${cons} : ${alt})`;
      }

      case ASTType.AWAIT_EXPR: {
        const expression = this.compileExpression(expr.expression, locals, componentName);
        return `await ${expression}`;
      }

      case ASTType.NEW_EXPR: {
        const callee = this.compileExpression(expr.callee, locals, componentName);
        const args = expr.args
          .map(a => this.compileExpression(a, locals, componentName))
          .join(', ');
        return `new ${callee}(${args})`;
      }

      case ASTType.OPTIONAL_CHAIN: {
        const obj = this.compileExpression(expr.object, locals, componentName);
        return `${obj}?.${expr.property}`;
      }

      default:
        return 'null';
    }
  }

  compileViewSwitch(node, locals = new Set(), componentName) {
    const disc = this.compileExpression(node.discriminant, locals, componentName);

    // Build ternary chain: case1 ? [...] : case2 ? [...] : [default...]
    let chain = '[]';
    for (let i = node.cases.length - 1; i >= 0; i--) {
      const c = node.cases[i];
      const children = (c.children || []).map(child => {
        if (child.type === ASTType.ELEMENT) return this.compileElement(child, locals, componentName);
        if (child.type === ASTType.CONDITIONAL) return this.compileConditional(child, locals, componentName);
        if (child.type === ASTType.LOOP) return this.compileLoop(child, locals, componentName);
        if (child.type === ASTType.VIEW_SWITCH) return this.compileViewSwitch(child, locals, componentName);
        return 'null';
      });
      const childrenArr = `[${children.join(', ')}]`;

      if (c.test === null) {
        // default case
        chain = childrenArr;
      } else {
        const test = this.compileExpression(c.test, locals, componentName);
        chain = `(_d === ${test}) ? ${childrenArr} : ${chain}`;
      }
    }

    // Hoist discriminant into IIFE to avoid evaluating it multiple times
    return `((_d) => ${chain})(${disc})`;
  }

  compileConditional(node, locals = new Set(), componentName) {
    const cond = this.compileExpression(node.condition, locals, componentName);
    const cons = (node.consequent || [])
      .map(c => this.compileElement(c, locals, componentName))
      .join(', ');
    const consArr = `[${cons}]`;

    let altArr;
    if (!node.alternate) {
      altArr = '[]';
    } else if (node.alternate.length === 1 && node.alternate[0].type === ASTType.CONDITIONAL) {
      // else if — nest as a single-element array so normalizeChildren flattens it
      altArr = `[${this.compileConditional(node.alternate[0], locals, componentName)}]`;
    } else {
      const alt = node.alternate
        .map(c => this.compileElement(c, locals, componentName))
        .join(', ');
      altArr = `[${alt}]`;
    }

    return `(${cond}) ? ${consArr} : ${altArr}`;
  }

  compileLoop(node, locals = new Set(), componentName) {
    const listExpr = this.compileExpression(
      { type: ASTType.IDENTIFIER, name: node.list },
      locals,
      componentName
    );
    const innerLocals = new Set([...locals, node.item]);
    const body = (node.body || [])
      .map(c => this.compileElement(c, innerLocals, componentName))
      .join(', ');
    return `${listExpr}.map(${node.item} => [${body}])`;
  }

  // Compile an event handler expression.
  // Plain identifiers (function references) are emitted as-is.
  // Call expressions and others are wrapped in an arrow function.
  _compileHandler(handlerExpr, locals, componentName) {
    if (handlerExpr.type === ASTType.IDENTIFIER) {
      return this.compileExpression(handlerExpr, locals, componentName);
    }
    const compiled = this.compileExpression(handlerExpr, locals, componentName);
    return `(e) => { ${compiled}; }`;
  }

  serializeObject(obj) {
    const props = Object.entries(obj).map(([key, value]) => {
      if (key === 'content') return null;
      return `'${key}': ${value}`;
    }).filter(Boolean).join(', ');

    return `{ ${props} }`;
  }
}

module.exports = { Compiler };
