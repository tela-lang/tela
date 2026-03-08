const { Compiler } = require('../compiler');
const { TelaRuntime } = require('../runtime');
const assert = require('assert');

// Mock DOM
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><body><div id="app"></div></body>`);
global.document = dom.window.document;
global.window = dom.window;

// Initialize Runtime
const Tela = new TelaRuntime();
global.Tela = Tela;

console.log("Running Control Flow Order Test");

const source = `
component ListTest {
  state items: Array = ["First", "Second", "Third"]
  view {
    div {
      for (item in items) {
        span { content: item }
      }
    }
  }
}
`;

try {
  const compiler = new Compiler();
  const { js: compiledCode } = compiler.compile(source);
  // console.log("Compiled Code:\n", compiledCode);
  
  // Expose components globally
  const exposedCode = compiledCode.replace(/const (\w+) =/g, 'global.$1 =');
  eval(exposedCode);
  
  const container = document.getElementById('app');
  Tela.render(global.ListTest, container);
  
  const html = container.innerHTML;
  console.log("Rendered HTML:", html);
  
  // Check order
  const expected = '<span>First</span><span>Second</span><span>Third</span>';
  if (!html.includes(expected)) {
    // Check if it is reversed
    if (html.includes('<span>Third</span><span>Second</span><span>First</span>')) {
        throw new Error("FAILED: List items rendered in REVERSE order.");
    }
    throw new Error(`FAILED: Content mismatch. Expected to contain "${expected}"`);
  }
  
  console.log("Test Passed!");
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
