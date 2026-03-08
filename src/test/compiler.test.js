const { Compiler } = require('../compiler');

const sourceCode = `
component Counter {
  state count: Number = 0

  function increment() {
    count = count + 1
  }

  view {
    Container {
      style {
        color: "red"
      }
      
      Button {
        content: "Count: \${count}"
        @click: increment
      }
    }
  }
}
`;

function testCompiler() {
  console.log("Starting Compiler Test...");
  
  try {
    const compiler = new Compiler();
    const { js } = compiler.compile(sourceCode);
    
    console.log("Compilation successful!");
    console.log("--- Generated Code ---");
    console.log(js);
    console.log("----------------------");
    
    // Assertions
    if (!js.includes("Tela.defineComponent")) throw new Error("Missing Tela.defineComponent");
    if (!js.includes("state_Counter.count")) throw new Error("Missing state.count transformation");
    if (!js.includes("Tela.element(Container")) throw new Error("Missing Container element");
    if (!js.includes("Tela.element(Button")) throw new Error("Missing Button element");
    if (!js.includes("'onclick': increment")) throw new Error("Missing click handler");

    console.log("Test Passed!");

  } catch (error) {
    console.error("Compiler Test Failed:", error);
    process.exit(1);
  }
}

testCompiler();
