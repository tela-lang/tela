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
10. [Runtime Architecture](#runtime-architecture)
11. [Compilation Model](#compilation-model)
12. [Built-in Globals](#built-in-globals)

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

The following identifiers are reserved:

```
component  prop      state     route     store
function   async     return    await
if         else      for       in
while      break     continue
switch     case      default
try        catch     finally   throw
enum       model
computed   watch     emit
import     from      export
onMount    onUpdate  onDestroy
view       style     bind
true       false     null
```

> **Note:** `class` is **not** a reserved keyword. When written as an element attribute (`class: "my-class"`), it is parsed as an ordinary attribute name.

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

Template interpolation uses `${expr}` inside a double-quoted string:

```
"Hello, ${name}!"
```

State variables inside `${}` are automatically rewritten to their reactive accessor at compile time (e.g. `${count}` becomes `${state_Counter.count}` in the generated JS).

### Operators

```
+  -  *  /  %
===  !==  ==  !=  <  >  <=  >=
&&  ||  ??
!
=
?.  .  ?.[]
```

---

## Program Structure

A Tela source file consists of zero or more **top-level declarations** followed by exactly one **component declaration**.

### Top-level declarations

| Declaration | Syntax                              | Exportable | Purpose                             |
|-------------|-------------------------------------|------------|-------------------------------------|
| `import`    | `import Name from "path"`           | —          | Import a component from another file |
| `enum`      | `enum Name { VAL1 VAL2 ... }`       | Yes        | Compile-time constant set           |
| `model`     | `model Name { f1: T f2: T ... }`    | Yes        | Data-shape factory function         |
| `store`     | `store Name { f: T = v ... }`       | Yes        | Shared reactive state across components |

Prefix any declaration with `export` to make it available for import by other files:

```tela
export enum Status { ACTIVE INACTIVE }
export model User { name: String email: String }
export store AppStore { count: Number = 0 }
```

A component can also be exported:

```tela
export component Badge { ... }
```

### Import syntax

```tela
import MyComponent from "./components/MyComponent"
```

The imported name is then available as a child component in the `view` block.

### Component declaration

```
component Name {
  <member>*
}
```

A component has the following members, in any order (but conventionally in the order listed):

| Member            | Syntax                                | Purpose                                      |
|-------------------|---------------------------------------|----------------------------------------------|
| Route declaration | `route varName: Type`                 | Reactive URL-path variable                   |
| State declaration | `state varName: Type = expr`          | Local reactive state                         |
| Prop declaration  | `prop varName: Type`                  | Value passed in by the parent                |
| Computed property | `computed varName = expr`             | Derived value, re-evaluated on state change  |
| Watcher           | `watch varName { stmts }`             | Side-effect block run when state var changes |
| Function          | `[async] function name(params) { }`   | Callable logic                               |
| Lifecycle hook    | `onMount / onUpdate / onDestroy { }`  | Lifecycle callbacks                          |
| View block        | `view { <element> }`                  | Rendered output                              |

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

| Level | Operators / Forms                                                | Associativity |
|-------|------------------------------------------------------------------|---------------|
| 7     | `*` `/` `%`                                                      | left          |
| 6     | `+` `-`                                                          | left          |
| 5     | `<` `>` `<=` `>=`                                                | left          |
| 4     | `===` `!==` `==` `!=`                                            | left          |
| 3     | `&&`                                                             | left          |
| 2     | `\|\|`                                                             | left          |
| 1     | `??` (null coalescing)                                           | left          |
| 0     | `cond ? then : else` (ternary — lowest of all binary operators)  | right         |

> Primary expressions (literals, identifiers, calls, member access, unary `!`/`-`) bind tighter than all binary operators and are parsed first regardless of the table above.

### Optional chaining (`?.`)

```tela
user?.address?.city     // undefined if user or address is null/undefined
users?.[0]              // undefined if users is null/undefined
```

### Null coalescing (`??`)

Returns the left operand when it is not `null` or `undefined`; otherwise returns the right operand. Binds above the ternary operator.

```tela
name ?? "Anonymous"     // "Anonymous" only when name is null or undefined
```

To handle empty strings as well, use `||`:

```tela
name || "Anonymous"     // "Anonymous" when name is any falsy value
```

### Template strings

```tela
"Hello, ${firstName} ${lastName}!"
```

Any expression may appear inside `${}`.

### Object and array literals

```tela
{ key: "value", count: 0 }
[1, 2, 3]
```

---

## Statements

The following statement forms are valid inside function bodies, lifecycle hooks, and watcher bodies.

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

### Await

`await` is valid only inside an `async function`.

```tela
async function loadData() {
  response = await fetch("/api/data")
  data = await response.json()
}
```

### Emit

`emit` triggers a custom event, calling the corresponding prop passed in by the parent.

```tela
emit valueChange(newValue)
// Compiles to: instance.props.onValueChange?.(newValue)
```

The parent wires the handler with `@valueChange: myHandler` on the child component tag.

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

No fall-through. Each `case` body may contain **multiple statements**. Wrap with `{ }` only when needed for nested blocks; the `break` is injected automatically by the compiler.

### While

```tela
while (condition) {
  // ...
}
```

### For-in (iterate over array values)

```tela
for (item in collection) {
  // use item
}
```

Iterates over array **element values** (equivalent to JavaScript's `for...of`). `item` is a new binding scoped to each iteration. This is **not** JavaScript's `for...in` which iterates over keys.

### For (C-style)

```tela
for (i = 0; i < n; i = i + 1) {
  // ...
}
```

The compiler declares `i` with `let`. The init and update must be simple assignments to a single identifier.

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

Both `catch` and `finally` are optional but at least one must be present.

### Throw

```tela
throw "Something went wrong"
throw new Error("message")
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

| Attribute form       | Compiled output                                                  |
|----------------------|------------------------------------------------------------------|
| `content: expr`      | Sets `element.textContent`                                       |
| `attrName: expr`     | Sets HTML attribute (e.g. `href`, `src`, `class`, `placeholder`) |
| `key: expr`          | Stable identity for keyed list reconciliation — not set as an HTML attribute |
| `bind value: var`    | Two-way binding — reads and writes `var`; listens to `input` event |
| `bind attr: var`     | Two-way binding on any attribute name                            |
| `@click: handler`    | `addEventListener('click', ...)`                                 |
| `@input: handler`    | `addEventListener('input', ...)`                                 |
| `style { ... }`      | See [Style Syntax](#style-syntax)                                |

> `class` is an ordinary attribute name, not a keyword. Use `class: "my-css-class"` to apply external CSS classes (e.g. from Highlight.js or a global stylesheet). Tela's own scoped styles are applied automatically by the compiler.

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

In view context, each case renders its child element or component. Only the matching branch is rendered.

### Child component instantiation

```tela
MyComponent { propA: expr propB: expr }
```

Props are passed by name. Functions and callbacks can be passed as props. Custom events are wired with `@eventName: handler`.

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

| Value form              | Compiled output                   |
|-------------------------|-----------------------------------|
| String literal `"..."`  | Static CSS rule in stylesheet      |
| Number literal `42`     | Static CSS (unitless number)       |
| State/prop variable     | Inline style (reactive)            |
| Ternary expression      | Inline style (reactive)            |

### Scoping

Each element that has a `style` block is assigned a unique scoped class name of the form:

```
tela-ComponentName-tagName-index
```

For example: `tela-Counter-button-3`. This class is added to the element automatically; you do not write it yourself.

### Media queries

```tela
style {
  color: "black"
  @media (max-width: 768px) {
    color: "red"
  }
}
```

Media queries compile to proper `@media` rules in the CSS file.

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

- The route variable is initialised to `window.location.pathname` at mount time.
- The compiler auto-injects a `navigate(dest)` helper (unless the developer defines their own). Calling `navigate("/about")` calls `history.pushState` and updates the route variable, triggering a re-render.
- A named `popstate` listener is registered so the browser back/forward buttons update the route variable.
- The listener is removed during `onDestroy` via a generated cleanup function.

### `navigate` function

```tela
navigate("/path")   // pushes to browser history and updates route variable
```

If the component defines its own `function navigate(...)`, the compiler-injected version is suppressed.

### SPA server fallback

For deep-link support, the server must return `index.html` for all client-side routes. In Spring Boot:

```java
@GetMapping({"/", "/home", "/about"})
public String index() { return "index"; }
```

### Route parameters

Declare a second `route params: Object` to capture named segments from the URL:

```tela
component App {
  route path: String
  route params: Object

  view {
    switch (path) {
      case "/":           Home {}
      case "/users/:id":  UserDetail { id: params.id }
      default:            NotFound {}
    }
  }
}
```

The compiler extracts the pattern list from the `switch` case literals and generates a `Tela.matchRoute()` call at mount time and inside `navigate()`. The matched pattern is stored in `path`; the extracted parameter map is stored in `params`.

Pattern syntax: `:paramName` segments match any single URL segment and capture its value.

### Constraints

- A component may declare at most two `route` variables: one `String` for the matched pattern, one `Object` for extracted URL parameters.
- `route` is intended for top-level app shell components.

---

## Runtime Architecture

Tela uses a **Virtual DOM with component-level re-rendering**. Understanding this model helps predict performance and debugging behavior.

### Update cycle

```
state write (Proxy set trap)
  → instance.update()                   ← synchronous, immediate
  → render function re-runs             ← produces new vnode tree
  → _patchChildren / _patchNode         ← diffs old vs new vnodes
  → targeted DOM mutations              ← only changed nodes touched
```

### Granularity

Re-renders are **per-component**. A state write in component A triggers a re-diff of A's subtree only. Child components are reused by identity (cursor-based positional cache); only changed props are patched through.

This is the same model as React/Preact/Vue — deliberately chosen for predictability over more aggressive compile-time optimizations.

### Keyed list reconciliation

When children have a `key:` attribute, the runtime uses a map-based algorithm instead of index-based diffing:
1. Build `key → { vnode, domNode }` map from the old children
2. For each new child, look up its key and patch the existing DOM node in place
3. Remove any old keyed nodes not present in the new list
4. Reorder to match new order with `insertBefore`

This preserves DOM identity (input focus, scroll position, CSS transitions) across list updates.

### Global store batching

`Tela.store()` subscribers are notified **asynchronously** via a microtask (`Promise.resolve().then()`). Multiple synchronous writes to the same store in one event handler produce exactly one subscriber pass per tick, avoiding redundant re-renders across components.

### No-op guard

Both `Tela.reactive()` and `Tela.store()` skip all update logic when `newValue === oldValue`, preventing cascading re-renders from identity-preserving writes.

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

Each component compiles to a factory function registered on `window`:

```js
const Counter = Tela.defineComponent({
  name: 'Counter',
  setup(instance) {
    // State proxy
    const state_Counter = Tela.reactive({ count: 0 }, instance.update, {
      // watchers (if any)
    });

    // Computed properties (if any)
    const computed_Counter = {
      get doubled() { return state_Counter.count * 2; }
    };

    // Functions
    const increment = () => { state_Counter.count = state_Counter.count + 1; };

    // Lifecycle hooks set on instance
    instance.onMount = () => { ... };

    // Render function
    return () => Tela.element('div', { ... }, [...]);
  }
});
window.Counter = Counter;
```

### State variable rewriting

Inside template strings and expressions, bare state variable names are rewritten to their `state_ComponentName.varName` form. For example, `${count}` in a `content:` string compiles to `` `${state_Counter.count}` `` in the output.

### Generated CSS

All `style` blocks compile to a single `.css` file. Literal values become static rules; state-dependent values are applied as inline styles at runtime.

```css
.tela-Counter-button-3 {
  background: #34786e;
  padding: 8px 20px;
}
```

### Scoped class names

Each element with a `style` block receives a unique class of the form `tela-ComponentName-tagName-index` (e.g. `tela-App-div-0`). The index is a simple global counter incremented during compilation — not a hash.

### Reactivity

State is wrapped in a JavaScript `Proxy`. Any write to a state variable (`state_Comp.x = val`) triggers `instance.update()`, which re-runs the render function and reconciles the DOM.

### Computed properties

```tela
computed doubled = count * 2
```

Compiles to a getter on a `computed_ComponentName` object. Changes to any state variable referenced in the expression cause the getter to return a fresh value on the next render.

### Watchers

```tela
watch count {
  console.log("count changed to", count)
}
```

Compiles to a watcher entry passed to `Tela.reactive`. The body runs whenever the watched variable is assigned.

---

## Built-in Globals

The following are available inside any Tela component. Standard browser APIs (`window`, `document`, `fetch`, etc.) are available because Tela targets the browser — they are not injected by the compiler. Only `navigate` is compiler-injected.

| Name                        | Source              | Description                                     |
|-----------------------------|---------------------|-------------------------------------------------|
| `navigate(path)`            | Compiler-injected   | Client-side navigation (only when `route` is declared; suppressed if developer defines their own) |
| `window`                    | Browser             | Global browser object                           |
| `document`                  | Browser             | DOM document                                    |
| `console`                   | Browser             | Console API                                     |
| `fetch(url, opts?)`         | Browser             | Fetch API                                       |
| `JSON.stringify(val)`       | Browser             | Serialize to JSON                               |
| `JSON.parse(str)`           | Browser             | Parse JSON                                      |
| `Object.freeze(obj)`        | Browser             | Freeze object (used internally by compiled `enum`) |
| `setTimeout / clearTimeout` | Browser             | Timer APIs                                      |
| `setInterval / clearInterval` | Browser           | Interval APIs                                   |

---

*This specification is a living document and will be updated as the language evolves.*
