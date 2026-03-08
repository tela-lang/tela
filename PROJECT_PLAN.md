# Tela Project Plan

## Phase 1: Foundation & Design (CURRENT)
- [x] Clean slate (Delete old files).
- [ ] Define Language Specification & Architecture (`DESIGN_PROPOSAL.md`).
- [ ] **Milestone**: User Approval of Design.

## Phase 2: The Parser (AST Generation)
Goal: Accurately convert Tela source code into a structured Abstract Syntax Tree (AST).

1.  **Lexer (Tokenizer)**
    -   Implement `Tokenizer` class.
    -   Support Keywords, Identifiers, Strings, Numbers, Operators, Punctuation.
    -   *Verification*: Unit tests ensuring source code becomes correct token list.

2.  **Parser Core**
    -   Implement `Parser` class.
    -   Methods: `parseProgram`, `parseComponent`, `parseView`, `parseElement`, `parseStyle`, `parseExpression`.
    -   *Verification*: Unit tests ensuring tokens become correct AST JSON.

## Phase 3: The Compiler (Code Generation)
Goal: Convert AST into executable JavaScript.

1.  **Runtime Library**
    -   Create a minimal runtime (`runtime.js`) to handle:
        -   Element creation (`createElement`).
        -   State management (Signals or simple reactive objects).
        -   Event listeners.

2.  **Code Generator**
    -   Implement `Compiler` class.
    -   Transform AST nodes into calls to `runtime.js`.
    -   Handle CSS generation/injection.
    -   *Verification*: Compile simple components and check generated JS syntax.

## Phase 4: Integration & Execution
Goal: Run a real Tela application in a browser environment.

1.  **End-to-End Test**
    -   Create `examples/counter.tela`.
    -   Compile it using the new CLI/Script.
    -   Load it in a browser (`index.html`).
    -   Verify interactivity (Clicking buttons updates state).

## Strict Rules for Implementation
1.  **No Monolithic Commits**: Implement one small piece at a time (e.g., "Implement Tokenizer only").
2.  **Verify First**: Write the test case (or define the expected output) before writing the implementation code.
3.  **User Checkpoints**: Stop after each major component (Lexer, Parser, Compiler) to confirm with the user.
