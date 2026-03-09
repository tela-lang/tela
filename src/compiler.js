const { Parser } = require('./parser');
const { ASTType } = require('./ast-types');
const { TokenType } = require('./token-types');

class Compiler {
  constructor() {
    this.stateVariables = new Set();
    this.propVariables = new Set();
    this.computedVariables = new Set();
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
    const js = ast.components.map(component => this.compileComponent(component)).join('\n\n');

    const parts = [importLines, enumLines, modelLines, js].filter(Boolean);
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

  compileComponent(component) {
    this.stateVariables.clear();
    this.propVariables.clear();
    this.computedVariables.clear();

    component.state.forEach(s => this.stateVariables.add(s.name));
    component.props.forEach(p => this.propVariables.add(p.name));
    (component.computed || []).forEach(c => this.computedVariables.add(c.name));
    // Route vars behave like state (reads/writes go through state_X.name)
    (component.routes || []).forEach(r => this.stateVariables.add(r.name));

    const stateInit = [
      ...component.state.map(s => {
        const value = s.defaultValue
          ? this.compileExpression(s.defaultValue, new Set(), component.name)
          : 'null';
        return `${s.name}: ${value}`;
      }),
      ...(component.routes || []).map(r => `${r.name}: window.location.pathname`)
    ].join(',\n      ');

    const functions = component.functions
      .map(fn => this.compileFunction(fn, component.name))
      .join('\n\n    ');

    // Routing setup: navigate() + popstate listener + cleanup
    const userFunctionNames = new Set((component.functions || []).map(f => f.name));
    const routeSetup = (component.routes || []).map(r => {
      const statePath = `state_${component.name}.${r.name}`;
      const handlerName = `_onPopState_${r.name}`;
      const cleanupName = `_routeCleanup_${r.name}`;
      const navigateFn = userFunctionNames.has('navigate') ? '' :
        `const navigate = (dest) => {\n      window.history.pushState(null, '', dest);\n      ${statePath} = dest;\n      instance.update();\n    };`;
      return [
        navigateFn,
        `const ${handlerName} = () => { ${statePath} = window.location.pathname; instance.update(); };`,
        `window.addEventListener('popstate', ${handlerName});`,
        `const ${cleanupName} = () => { window.removeEventListener('popstate', ${handlerName}); };`
      ].filter(Boolean).join('\n    ');
    }).join('\n\n    ');

    // Lifecycle hooks
    // onMount runs inline in setup() so it has closure access to state/functions.
    // onUpdate/onDestroy remain as component properties (called by the runtime).
    const onMountHook = (component.lifecycleHooks || []).find(h => h.hookName === 'onMount');
    const onMountInline = onMountHook
      ? `// onMount\n    ${this.compileStatements(onMountHook.body, component.name)}`
      : '';

    const otherHooks = (component.lifecycleHooks || []).filter(h => h.hookName !== 'onMount');

    // Append route cleanup to onDestroy if there are route declarations
    const routeCleanupCalls = (component.routes || [])
      .map(r => `_routeCleanup_${r.name}();`)
      .join('\n      ');

    const lifecycleProps = otherHooks.map(hook => {
      let body = this.compileStatements(hook.body, component.name);
      if (hook.hookName === 'onDestroy' && routeCleanupCalls) {
        body = `${body}\n      ${routeCleanupCalls}`;
      }
      return `${hook.hookName}: function() {\n      ${body}\n    }`;
    });

    // If there are routes but no onDestroy hook, emit one for cleanup
    const hasOnDestroy = otherHooks.some(h => h.hookName === 'onDestroy');
    if (routeCleanupCalls && !hasOnDestroy) {
      lifecycleProps.push(`onDestroy: function() {\n      ${routeCleanupCalls}\n    }`);
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

    ${routeSetup}

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

      default:
        return '';
    }
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
              const regex = new RegExp(`\\$\\{(${v})(?=[.\\[}])`, 'g');
              val = val.replace(regex, `\${instance.props.$1`);
            });
            this.computedVariables.forEach(v => {
              const regex = new RegExp(`\\$\\{(${v})(?=[.\\[}])`, 'g');
              val = val.replace(regex, `\${computed_${componentName}.$1`);
            });
            // locals (loop vars, params) are already in JS scope — no transformation needed
            return `\`${val}\``;
          }
          return `"${expr.value}"`;
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
