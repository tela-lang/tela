const { Parser } = require('../parser');
const { ASTType } = require('../ast-types');

const sourceCode = `
component Counter {
  state count: Number = 0
  state title: String = "Counter App"

  function increment() {
    count = count + 1
  }

  view {
    Container {
      style {
        padding: 20px
        background-color: "white"
      }
      
      Text {
        content: "Current count: "
      }

      Button {
        content: "Increment"
        @click: increment
      }
    }
  }
}
`;

function testParser() {
  console.log("Starting Parser Test...");
  
  try {
    const parser = new Parser(sourceCode);
    const ast = parser.parse();
    
    console.log("Parsing completed without errors.");
    
    // Verify AST Structure
    if (ast.type !== ASTType.PROGRAM) throw new Error("Root should be Program");
    if (ast.components.length !== 1) throw new Error("Should have 1 component");
    
    const component = ast.components[0];
    if (component.name !== 'Counter') throw new Error("Component name should be Counter");
    if (component.state.length !== 2) throw new Error("Should have 2 state variables");
    if (component.functions.length !== 1) throw new Error("Should have 1 function");
    
    // Verify View
    const view = component.view;
    if (!view) throw new Error("View should exist");
    
    const root = view.root;
    if (root.tagName !== 'Container') throw new Error("Root element should be Container");
    
    // Verify Styles
    if (root.styles.length !== 1) throw new Error("Container should have 1 style block");
    const styleBlock = root.styles[0];
    if (styleBlock.properties.length !== 2) throw new Error("Style block should have 2 properties");
    
    const padding = styleBlock.properties.find(p => p.name === 'padding');
    if (padding.value.value !== '20px') throw new Error(`Padding should be 20px, got ${JSON.stringify(padding.value)}`);
    
    // Verify Children
    if (root.children.length !== 2) throw new Error("Container should have 2 children");
    
    const button = root.children[1];
    if (button.tagName !== 'Button') throw new Error("Second child should be Button");
    
    // Verify Event Handler
    if (button.events.length !== 1) throw new Error("Button should have 1 event handler");
    if (button.events[0].event !== 'click') throw new Error("Event should be click");
    if (button.events[0].handler.name !== 'increment') throw new Error("Handler should be increment");

    console.log("Test Passed!");

  } catch (error) {
    console.error("Parser Test Failed:", error);
    process.exit(1);
  }
}

testParser();
