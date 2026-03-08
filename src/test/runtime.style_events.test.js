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

console.log("Running Style and Events Test");

const source = `
component StyleEventTest {
  state color: String = "red"
  state count: Number = 0

  function toggle() {
    if (color == "red") {
      color = "blue"
    } else {
      color = "red"
    }
    count = count + 1
  }

  view {
    div {
      style {
        color: color
        font-size: 20px
      }
      @click: toggle
      content: "Count: \${count}"
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
  Tela.render(global.StyleEventTest, container);
  
  const div = container.firstElementChild;
  
  // 1. Check Initial Style
  console.log("Checking initial style...");
  if (div.style.color !== 'red') {
      throw new Error(`FAILED: Expected color red, got ${div.style.color}`);
  }
  // Font size is now a static style (class), so we check class presence instead of style
  if (!div.className.includes('tela-StyleEventTest-div')) {
      throw new Error(`FAILED: Expected class to include tela-StyleEventTest-div, got ${div.className}`);
  }
  
  // 2. Test Event
  console.log("Testing click event...");
  div.click();
  
  // 3. Check Updated Style and Content
  console.log("Checking updated state...");
  
  // Get the new div because the runtime replaces the entire DOM on update
  const newDiv = container.firstElementChild;
  
  if (newDiv.innerHTML !== 'Count: 1') {
      throw new Error(`FAILED: Expected content "Count: 1", got "${newDiv.innerHTML}"`);
  }
  if (newDiv.style.color !== 'blue') {
      throw new Error(`FAILED: Expected color blue, got ${newDiv.style.color}`);
  }
  
  console.log("Test Passed!");
} catch (e) {
  console.error(e.message);
  // console.error(e.stack);
  process.exit(1);
}
