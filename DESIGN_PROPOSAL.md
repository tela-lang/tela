# Tela Language Design & Architecture Proposal

## 1. Language Overview
Tela is a modern, declarative UI language designed for building reactive web interfaces. It combines the structure of HTML, the styling of CSS, and the logic of JavaScript into a unified, component-based syntax.

### Key Features
- **Single File Components**: Logic, View, and Style in one cohesive block.
- **Reactive State**: built-in state management.
- **Scoped Styles**: CSS that applies only to the current component.
- **Event Handling**: Direct binding of events to functions.

## 2. Syntax Specification

### Component Structure
```tela
component MyComponent {
  # State Declarations
  state count: Number = 0
  state name: String = "Tela"

  # Props Definition
  prop title: String

  # logic / Functions
  function increment() {
    count = count + 1
  }

  # View Definition (The UI Tree)
  view {
    Container {
      style {
        padding: 20px
        background-color: "white"
      }

      Text {
        content: "Hello ${name}"
        style { font-size: 18px }
      }

      Button {
        content: "Count is ${count}"
        @click: increment
      }
    }
  }
}
```

### Grammar Rules (Simplified)
- **Program** -> Component+
- **Component** -> `component` Identifier `{` ComponentBody `}`
- **ComponentBody** -> (StateDecl | PropDecl | FunctionDecl | ViewDecl)*
- **ViewDecl** -> `view` `{` Element `}`
- **Element** -> Identifier `{` (StyleDecl | Attribute | Element)* `}`
- **StyleDecl** -> `style` `{` (Property: Value)* `}`

## 3. Compiler Architecture

The compilation process will follow a standard pipeline:

### A. Tokenizer (Lexer)
Converts raw source code into a stream of tokens.
- **Input**: String source code.
- **Output**: Array of Tokens (e.g., `KEYWORD`, `IDENTIFIER`, `LBRACE`, `STRING`, `NUMBER`).
- **Strategy**: A state-machine based tokenizer for robustness against whitespace and comments.

### B. Parser (AST Generation)
Analyzes the token stream and builds an Abstract Syntax Tree (AST).
- **Input**: Array of Tokens.
- **Output**: JSON-like AST Object.
- **Strategy**: Recursive Descent Parser. This allows for clear, readable, and debuggable parsing logic that mirrors the grammar structure.

### C. Code Generator (Compiler)
Traverses the AST and generates target code (JavaScript + CSS).
- **Input**: AST.
- **Output**: 
  - `js`: JavaScript module exporting the component logic and render function.
  - `css`: Extracted CSS string (if using CSS-in-JS or separate stylesheets).
- **Runtime**: A lightweight runtime helper will be needed to handle DOM creation and state updates.

## 4. Implementation Strategy
We will strictly separate the **Parser** from the **Compiler**.
1. **Parser**: Responsible ONLY for understanding the syntax and erroring on invalid code.
2. **Compiler**: Responsible for translating valid AST into executable JavaScript.
