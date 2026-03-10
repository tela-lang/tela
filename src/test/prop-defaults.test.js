'use strict';

const assert = require('node:assert');
const { test } = require('node:test');
const { Compiler } = require('../compiler');
const { Parser } = require('../parser');

function compileOk(source) {
  return new Compiler().compile(source).js;
}

function parse(source) {
  return new Parser(source).parse();
}

// ─── Parser ──────────────────────────────────────────────────────────────────

test('prop with default value is parsed and stored on the node', () => {
  const ast = parse(`
    component Button {
      prop label: String = "Click me"
      view { div {} }
    }
  `);
  const prop = ast.components[0].props[0];
  assert.strictEqual(prop.name, 'label');
  assert.strictEqual(prop.defaultValue.value, 'Click me');
});

test('prop without default value has null defaultValue', () => {
  const ast = parse(`
    component Button {
      prop label: String
      view { div {} }
    }
  `);
  assert.strictEqual(ast.components[0].props[0].defaultValue, null);
});

test('prop with numeric default value is parsed', () => {
  const ast = parse(`
    component Counter {
      prop start: Number = 0
      view { div {} }
    }
  `);
  assert.strictEqual(ast.components[0].props[0].defaultValue.value, 0);
});

test('prop with boolean default value is parsed', () => {
  const ast = parse(`
    component Toggle {
      prop active: Boolean = false
      view { div {} }
    }
  `);
  assert.strictEqual(ast.components[0].props[0].defaultValue.value, false);
});

// ─── Compiler ────────────────────────────────────────────────────────────────

test('prop with string default compiles to nullish coalescing', () => {
  const js = compileOk(`
    component Button {
      prop label: String = "Click me"
      view { div { content: label } }
    }
  `);
  assert.ok(js.includes('(instance.props.label ?? "Click me")'), 'should use ?? for prop default');
});

test('prop with numeric default compiles to nullish coalescing', () => {
  const js = compileOk(`
    component Counter {
      prop start: Number = 0
      view { div { content: start } }
    }
  `);
  assert.ok(js.includes('(instance.props.start ?? 0)'), 'should use ?? with numeric default');
});

test('prop with boolean default compiles to nullish coalescing', () => {
  const js = compileOk(`
    component Toggle {
      prop active: Boolean = false
      view {
        div {
          if (active) { span { content: "on" } }
        }
      }
    }
  `);
  assert.ok(js.includes('(instance.props.active ?? false)'), 'should use ?? with boolean default');
});

test('prop without default compiles to plain instance.props access', () => {
  const js = compileOk(`
    component Button {
      prop label: String
      view { div { content: label } }
    }
  `);
  assert.ok(js.includes('instance.props.label'), 'should access prop directly');
  assert.ok(!js.includes('??'), 'should not have ?? operator');
});

test('prop default used in template literal string', () => {
  const js = compileOk(`
    component Greeting {
      prop name: String = "World"
      view { div { content: "Hello \${name}!" } }
    }
  `);
  assert.ok(js.includes('(instance.props.name ?? "World")'), 'should use ?? in template literal context');
});

// ─── Auto-inject navigate() ──────────────────────────────────────────────────

test('navigate is auto-injected in components without route declaration', () => {
  const js = compileOk(`
    component Button {
      view { div {} }
    }
  `);
  assert.ok(js.includes('const navigate = (dest) =>'), 'should inject navigate');
  assert.ok(js.includes('window.history.pushState'), 'should use pushState');
  assert.ok(js.includes('window.dispatchEvent'), 'should dispatch popstate');
});

test('navigate not injected if user defines their own navigate in non-routing component', () => {
  const js = compileOk(`
    component Button {
      function navigate(dest) {
        doSomething()
      }
      view { div {} }
    }
  `);
  assert.ok(!js.includes('window.history.pushState'), 'should not inject navigate when user defined one');
  assert.ok(js.includes('const navigate = (dest) =>'), 'user navigate should still compile');
});

test('routing component still gets full navigate with route update', () => {
  const js = compileOk(`
    component App {
      route path: String
      view {
        div {
          switch (path) {
            case "/": Home {}
            default: NotFound {}
          }
        }
      }
    }
  `);
  assert.ok(js.includes('const navigate = (dest) =>'), 'routing component has navigate');
  assert.ok(js.includes('window.history.pushState'), 'routing component uses pushState');
  assert.ok(js.includes('instance.update()'), 'routing navigate calls instance.update');
});

console.log('Prop defaults and navigate injection tests loaded.');
