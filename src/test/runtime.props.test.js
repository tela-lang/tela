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

console.log("Running Props Passing Test");

const source = `
component ChildComp {
  prop label: String
  
  view {
    div {
      style { border: "1px solid black" }
      content: "Child says: \${label}"
    }
  }
}

component ParentComp {
  state parentMsg: String = "Hello from Parent"
  
  function changeMsg() {
    parentMsg = "Updated Message"
  }

  view {
    div {
      h1 { content: "Parent Component" }
      ChildComp {
        label: parentMsg
      }
      button {
        @click: changeMsg
        content: "Update"
      }
    }
  }
}
`;

try {
  const compiler = new Compiler();
  const { js: compiledCode } = compiler.compile(source);
  console.log("Compiled Code:\n", compiledCode);
  
  // Expose components globally
  const exposedCode = compiledCode.replace(/const (\w+) =/g, 'global.$1 =');
  eval(exposedCode);
  
  const container = document.getElementById('app');
  Tela.render(global.ParentComp, container);
  
  // 1. Check Initial Render
  console.log("Checking initial render...");
  // Styles are now extracted to classes, so we can't search by style attribute
  // We search by content
  const childDiv = Array.from(container.querySelectorAll('div')).find(d => d.innerHTML.includes("Child says:"));
  if (!childDiv) throw new Error("FAILED: Child component not found");
  
  if (!childDiv.innerHTML.includes("Child says: Hello from Parent")) {
      throw new Error(`FAILED: Expected "Child says: Hello from Parent", got "${childDiv.innerHTML}"`);
  }
  
  // 2. Test Reactive Props
  console.log("Testing reactive props...");
  const btn = container.querySelector('button');
  btn.click();
  
  // Get new child div (since full re-render)
  const newChildDiv = Array.from(container.querySelectorAll('div')).find(d => d.innerHTML.includes("Child says:"));
  
  if (!newChildDiv.innerHTML.includes("Child says: Updated Message")) {
      throw new Error(`FAILED: Expected "Child says: Updated Message", got "${newChildDiv.innerHTML}"`);
  }
  
  console.log("Test Passed!");
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
