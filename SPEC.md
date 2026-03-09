# Tela Language Specification

**Version:** 0.1
**Status:** Draft

---

## Table of Contents

1. [Introduction](#introduction)
2. [Lexical Grammar](#lexical-grammar)
3. [Program Structure](#program-structure)
4. [Types](#types)
5. [Expressions](#expressions)
6. [Statements](#statements)
7. [View Syntax](#view-syntax)
8. [Style Syntax](#style-syntax)
9. [Routing](#routing)
10. [Compilation Model](#compilation-model)
11. [Built-in Globals](#built-in-globals)

---

## Introduction

Tela is a compiled, declarative UI language targeting the browser. A `.tela` source file contains a single component — a self-contained unit of reactive UI — that the Tela compiler transforms into standard JavaScript and CSS files. There is no runtime template engine; all rendering logic is compiled away.

Tela is designed to be readable by Java and Spring Boot developers: it uses a brace-based block syntax, explicit type annotations, and familiar control-flow constructs.

---

## Lexical Grammar

### Character encoding

Tela source files are UTF-8.

### Comments

```
// single-line comment
```

Block comments (`/* ... */`) are not currently supported.

### Whitespace

Whitespace (spaces, tabs, newlines) is insignificant between tokens. Newlines are not statement terminators.

### Keywords

```
component  prop    state   route
function   async   return  await
if         else    for     in
while      break   continue
switch     case    default
try        catch   finally throw
enum       model
onMount    onUpdate  onDestroy
view       style   bind    class
```

### Identifiers

An identifier starts with a letter or `_`, followed by letters, digits, or `_`.

```
identifier ::= [a-zA-Z_][a-zA-Z0-9_]*
```

### Literals

| Kind    | Examples                         |
|---------|----------------------------------|
| Number  | `0`, `42`, `3.14`, `-1`          |
| String  | `"hello"`, `"24px"`, `"#fff"`    |
| Boolean | `true`, `false`                  |
| Null    | `null`                           |
| Array   | `[]`, `[1, 2, 3]`                |
| Object  | `{}`, `{ key: value }`           |

### Template strings

Template interpolation uses `${expr}` inside a double-quoted string. Inside `.tela` source the `$` must be escaped with `\` in JS-string contexts (data.js), but in the compiled output the `$` is literal.

```
"Hello, ${name}!"
```

### Operators

```
+  -  *  /  %
==  !=  <  >  <=  >=
&&  ||  ??
!
=
?.  .
```

### Punctuation

```
( )  [ ]  { }  ,  :  ;
```

---

## Program Structure

A Tela source file consists of zero or more **top-level declarations** followed by exactly one **component declaration**.

### Top-level declarations

| Declaration | Syntax                           | Purpose                             |
|-------------|----------------------------------|-------------------------------------|
| `enum`      | `enum Name { VAL1 VAL2 ... }`    | Compile-time constant set           |
| `model`     | `model Name { f1: T f2: T ... }` | Data-shape factory function         |

### Component declaration

```
component Name {
  <member>*
}
```

A component has the following members, in any order (but conventionally in the order listed):

| Member            | Syntax                              |
|-------------------|-------------------------------------|
| Route declaration | `route varName: Type`               |
| State declaration | `state varName: Type = expr`        |
| Prop declaration  | `prop varName: Type`                |
| Function          | `[async] function name(params) { }` |
| Lifecycle hook    | `onMount { }` / `onUpdate { }` / `onDestroy { }` |
| View block        | `view { <element> }`                |

---

## Types

Type annotations are hints for documentation and tooling. The compiler does not perform static type checking.

| Annotation | Meaning                      |
|------------|------------------------------|
| `String`   | String value                 |
| `Number`   | Numeric value                |
| `Boolean`  | Boolean value                |
| `Array`    | Array value                  |
| `Function` | Callable value (props only)  |
| `Object`   | Plain object                 |

Custom model names may be used where `Object` would appear.

---

## Expressions

### Precedence table (highest to lowest)

| Level | Operators / Forms                  | Associativity |
|-------|------------------------------------|---------------|
| 12    | Primary: literals, identifiers, `(expr)`, `[arr]`, `{obj}` | — |
| 11    | Member access: `a.b`, `a[b]`, optional chain `a?.b` | left |
| 11    | Call: `f(args...)`, `a?.method(args)` | left |
| 10    | Unary: `!`, `-`                    | right |
| 9     | `*` `/` `%`                        | left |
| 8     | `+` `-`                            | left |
| 7     | `<` `>` `<=` `>=`                  | left |
| 6     | `==` `!=`                          | left |
| 5     | `&&`                               | left |
| 4     | `\|\|`                               | left |
| 3     | Ternary: `cond ? then : else`      | right |
| 1     | `??` (null coalescing)             | left |

### Optional chaining (`?.`)

```tela
user?.address?.city     // null if user or address is null/undefined
users?.[0]              // null if users is null/undefined
```

### Null coalescing (`??`)

Returns the left operand when it is not `null` or `undefined`; otherwise returns the right operand.

```tela
name ?? "Anonymous"     // "Anonymous" only when name is null or undefined
```

To handle empty strings use `||`:

```tela
name || "Anonymous"     // "Anonymous" when name is falsy (null, undefined, "")
```

### Template strings

```tela
"Hello, ${firstName} ${lastName}!"
```

Template strings are evaluated at render time. Any expression may appear inside `${}`.

### Object and array literals

```tela
{ key: "value", count: 0 }
[1, 2, 3]
```

---

## Statements

### Assignment

```tela
varName = expr
```

Assigning to a `state` variable triggers a re-render.

### Function call statement

```tela
functionName(arg1, arg2)
```

### Return

```tela
return expr
return          // equivalent to return null
```

### If / else

```tela
if (condition) {
  // ...
} else if (otherCondition) {
  // ...
} else {
  // ...
}
```

### Switch

```tela
switch (expr) {
  case value1:
    statement
  case value2:
    statement
  default:
    statement
}
```

No fall-through. Each `case` body is a single statement (use a block `{ }` for multiple).

### While

```tela
while (condition) {
  // ...
}
```

### For-in (range over array)

```tela
for (item in collection) {
  // use item
}
```

Iterates over array elements. `item` is a new binding per iteration.

### For (C-style)

```tela
for (i = 0; i < n; i = i + 1) {
  // ...
}
```

The initialiser, condition, and update are all expressions.

### Break and Continue

`break` and `continue` are valid inside `while` and `for` loops.

### Try / Catch / Finally

```tela
try {
  // risky code
} catch (e) {
  // handle error — e is the caught exception
} finally {
  // always runs
}
```

`catch` and `finally` are both optional (but at least one must be present).

### Throw

```tela
throw "Something went wrong"
throw new Error("message")
```

### Await

`await` is valid only inside an `async function`.

```tela
async function loadData() {
  response = await fetch("/api/data")
  data = await response.json()
}
```

---

## View Syntax

The `view` block describes the component's rendered output. It contains a tree of **elements**.

### Element

```
ElementName {
  <attribute>*
  <child>*
}
```

HTML elements use lowercase names (`div`, `p`, `button`, …). Child components use PascalCase.

### Attributes

| Attribute form       | Compiled output                              |
|----------------------|----------------------------------------------|
| `content: expr`      | Sets `element.textContent`                   |
| `attr: expr`         | Sets HTML attribute (e.g. `href`, `src`)     |
| `bind value: var`    | Two-way binding — sets value and listens to `input` event |
| `class: expr`        | Sets `className`                             |
| `@click: handler`    | `addEventListener('click', ...)`             |
| `@input: handler`    | `addEventListener('input', ...)`             |
| `style { ... }`      | See [Style Syntax](#style-syntax)            |

### Control flow in view

#### if / else

```tela
if (condition) {
  div { content: "yes" }
} else {
  div { content: "no" }
}
```

#### for-in

```tela
for (item in list) {
  div { content: "${item.name}" }
}
```

#### switch

```tela
switch (value) {
  case "a":
    ComponentA {}
  case "b":
    ComponentB {}
  default:
    FallbackComponent {}
}
```

In view context, each case renders its child element/component. Only the matching branch is rendered.

### Child component instantiation

```tela
MyComponent { propA: expr propB: expr }
```

Props are passed by name. Functions can be passed as props.

---

## Style Syntax

The `style` block inside an element sets CSS properties.

```tela
div {
  style {
    background: "#ffffff"
    padding: "16px 24px"
    font-size: "14px"
    opacity: opacityLevel
  }
}
```

### Property value resolution

| Value form              | Compiled output                |
|-------------------------|--------------------------------|
| String literal `"..."`  | Static CSS in stylesheet       |
| Number literal `42`     | Static CSS (unitless number)   |
| State/prop variable     | Inline style (reactive)        |
| Ternary expression      | Inline style (reactive)        |

### Scoping

All CSS rules are scoped by a generated class name unique to the component (e.g. `.App-x7f3`). Child component trees are not affected.

### Media queries

```tela
style {
  color: "black"
  @media (max-width: 768px) {
    color: "red"
  }
}
```

Media queries may appear inside `style` blocks. They compile to proper `@media` rules in the CSS file.

---

## Routing

The `route` declaration creates a reactive variable that mirrors `window.location.pathname` and enables client-side navigation.

```tela
component App {
  route path: String

  view {
    switch (path) {
      case "/home":   Home {}
      case "/about":  About {}
      default:        NotFound {}
    }
  }
}
```

### Semantics

- The `route` variable is initialised to `window.location.pathname` at mount time.
- The compiler injects a `navigate(dest)` helper function (unless the developer defines their own). Calling `navigate("/about")` calls `history.pushState` and updates the route variable.
- A `popstate` listener is registered so the browser back/forward buttons update the route variable.
- The listener is removed during `onDestroy`.

### `navigate` function

```tela
navigate("/path")   // pushes to browser history and updates route variable
```

If the component defines its own `function navigate(...)`, the compiler-injected version is suppressed.

### SPA server fallback

For deep-link support, the server must return `index.html` for all application routes. In Spring Boot:

```java
@GetMapping({"/", "/home", "/about"})
public String index() { return "index"; }
```

### Constraints

- A component may have at most one `route` declaration.
- `route` is intended for top-level app shell components.

---

## Compilation Model

The Tela compiler is a single-pass compiler that transforms `.tela` → `.js` + `.css`.

### Pipeline

```
Source (.tela)
  → Tokenizer    produces token stream
  → Parser       produces AST (recursive descent + Pratt for expressions)
  → Compiler     produces JS + CSS strings
  → Output (.js, .css)
```

### Generated JavaScript

Each component compiles to a factory function exposed on `window`:

```js
window.App = (props) => {
  // State object (Proxy-based for reactivity)
  const state_App = new Proxy({ count: 0, ... }, handler);

  // Compiled functions
  function increment() { state_App.count = state_App.count + 1; }

  // Lifecycle
  instance.onMount = () => { ... };

  // View: returns array of DOM node factories
  instance.render = () => [
    Tela.el('div', { ... }, [
      Tela.el('button', { onclick: increment }, ['Click me'])
    ])
  ];

  return instance;
};
```

### Generated CSS

All `style` blocks compile to a single `.css` file. Literal values become static rules; state-dependent values are skipped (applied as inline styles at runtime).

```css
.App-x7f3-1 {
  background: #ffffff;
  padding: 16px 24px;
}
```

### Scoped class names

Each element with a `style` block receives a unique class of the form `ComponentName-hash-index`. These are deterministic across recompiles for the same source.

### Reactivity

State is wrapped in a JavaScript `Proxy`. Any write to a state variable (`state_Comp.x = val`) triggers `instance.update()`, which re-runs `render()` and reconciles the DOM.

---

## Built-in Globals

The following are available inside any component without import:

| Name                        | Type       | Description                                     |
|-----------------------------|------------|-------------------------------------------------|
| `navigate(path)`            | Function   | Client-side navigation (injected for `route` components) |
| `window`                    | Object     | Browser `window` object                         |
| `document`                  | Object     | Browser `document` object                       |
| `console`                   | Object     | Browser `console` object                        |
| `fetch(url, opts?)`         | Function   | Browser Fetch API                               |
| `JSON.stringify(val)`       | Function   | Serialize value to JSON string                  |
| `JSON.parse(str)`           | Function   | Parse JSON string                               |
| `Object.freeze(obj)`        | Function   | Freeze object (used internally by `enum`)       |
| `setTimeout(fn, ms)`        | Function   | Browser timer                                   |
| `setInterval(fn, ms)`       | Function   | Browser repeating timer                         |
| `clearTimeout(id)`          | Function   | Cancel timer                                    |
| `clearInterval(id)`         | Function   | Cancel repeating timer                          |

---

*This specification is a living document. It will be updated as the language evolves.*
