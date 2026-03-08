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

console.log("Running Component Composition Test");

const source = `
component Child {
  prop label: String

  view {
    div {
      content: "Child: \${label}"
      class: "child-component"
    }
  }
}

component Parent {
  view {
    div {
      h1 { content: "Parent Component" }
      Child {
        label: "Hello from Parent"
      }
    }
  }
}
`;

try {
  const compiler = new Compiler();
  const { js: compiledCode } = compiler.compile(source);
  // console.log("Compiled Code:\n", compiledCode);
  
  // Expose components globally for testing
  const exposedCode = compiledCode.replace(/const (\w+) =/g, 'global.$1 =');
  
  eval(exposedCode);
  
  if (typeof global.Parent === 'undefined') {
    throw new Error("Parent component was not defined by compiled code");
  }

  const container = document.getElementById('app');
  Tela.render(global.Parent, container);
  
  const html = container.innerHTML;
  console.log("Rendered HTML:", html);
  
  if (!html.includes("Child: Hello from Parent")) {
    throw new Error("Composition failed: Child content not found");
  }
  
  console.log("Test Passed!");
} catch (e) {
  console.error("Test Failed:", e);
  process.exit(1);
}
