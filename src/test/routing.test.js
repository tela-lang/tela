'use strict';

const assert = require('node:assert');
const { test } = require('node:test');
const { Compiler } = require('../compiler');
const { Parser } = require('../parser');

function compile(source) {
  return new Compiler().compile(source);
}

function compileOk(source) {
  return compile(source).js;
}

function parse(source) {
  return new Parser(source).parse();
}

// ─── Parser ──────────────────────────────────────────────────────────────────

test('route declaration parses into component.routes', () => {
  const ast = parse(`
    component App {
      route path: String
      view { div {} }
    }
  `);
  const comp = ast.components[0];
  assert.strictEqual(comp.routes.length, 1, 'should have one route');
  assert.strictEqual(comp.routes[0].type, 'RouteDeclaration');
  assert.strictEqual(comp.routes[0].name, 'path');
  assert.strictEqual(comp.routes[0].valueType, 'String');
});

test('two route declarations allowed: one String and one Object', () => {
  const ast = parse(`
    component App {
      route path: String
      route params: Object
      view { div {} }
    }
  `);
  assert.strictEqual(ast.components[0].routes.length, 2);
});

test('three route declarations throw a parse error', () => {
  assert.throws(() => {
    parse(`
      component App {
        route path: String
        route params: Object
        route extra: String
        view { div {} }
      }
    `);
  }, /At most two 'route' declarations/);
});

// ─── Compiler ────────────────────────────────────────────────────────────────

test('route var initialised from window.location.pathname', () => {
  const js = compileOk(`
    component App {
      route path: String
      view { div {} }
    }
  `);
  assert.ok(js.includes('path: window.location.pathname'), 'should init from pathname');
});

test('navigate() is auto-injected when route is declared', () => {
  const js = compileOk(`
    component App {
      route path: String
      view { div {} }
    }
  `);
  assert.ok(js.includes('const navigate = (dest) =>'), 'should inject navigate');
  assert.ok(js.includes('window.history.pushState(null,'), 'should push to history');
});

test('navigate() updates state and calls instance.update()', () => {
  const js = compileOk(`
    component App {
      route path: String
      view { div {} }
    }
  `);
  assert.ok(js.includes('state_App.path = dest'), 'should update state');
  assert.ok(js.includes('instance.update()'), 'should trigger re-render');
});

test('popstate listener is registered', () => {
  const js = compileOk(`
    component App {
      route path: String
      view { div {} }
    }
  `);
  assert.ok(js.includes("window.addEventListener('popstate'"), 'should listen for popstate');
  assert.ok(js.includes('_onPopState_path'), 'should use named handler reference');
});

test('cleanup function is emitted and wired to onDestroy', () => {
  const js = compileOk(`
    component App {
      route path: String
      view { div {} }
    }
  `);
  assert.ok(js.includes('window.removeEventListener'), 'should remove listener on destroy');
  assert.ok(js.includes('_routeCleanup_path'), 'should emit cleanup function');
  assert.ok(js.includes('onDestroy: function()'), 'should wire cleanup into onDestroy');
});

test('navigate injection skipped when developer defines their own navigate', () => {
  const js = compileOk(`
    component App {
      route path: String
      function navigate(dest) {
        path = dest
      }
      view { div {} }
    }
  `);
  // Should NOT have the auto-injected navigate (pushState)
  assert.ok(!js.includes('window.history.pushState'), 'should not inject navigate when user defined one');
  // The user's own navigate should still be compiled
  assert.ok(js.includes('const navigate = (dest) =>'), 'user navigate should still compile');
});

test('route var resolves to state_X.name in view expressions', () => {
  const js = compileOk(`
    component App {
      route path: String
      view {
        div {
          switch (path) {
            case "/home": span { content: "Home" }
            default:      span { content: "Other" }
          }
        }
      }
    }
  `);
  assert.ok(js.includes('state_App.path'), 'path should resolve to state_App.path in view');
});

test('route var resolves to state_X.name in function bodies', () => {
  const js = compileOk(`
    component App {
      route path: String
      function isHome() {
        result = path === "/home"
      }
      view { div {} }
    }
  `);
  assert.ok(js.includes('state_App.path'), 'path should resolve to state_App.path in functions');
});

test('existing onDestroy hook gets cleanup appended', () => {
  const js = compileOk(`
    component App {
      route path: String
      onDestroy {
        cleanup()
      }
      view { div {} }
    }
  `);
  assert.ok(js.includes('cleanup()'), 'existing onDestroy body preserved');
  assert.ok(js.includes('_routeCleanup_path()'), 'cleanup appended to existing onDestroy');
});

console.log('Routing Tests Passed!');
