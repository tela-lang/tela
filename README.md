<h1 align="center">Tela</h1>

<p align="center">
  <strong>A declarative UI language that compiles to plain JS + CSS</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@tela-lang/tela"><img src="https://img.shields.io/npm/v/@tela-lang/tela" alt="npm version"></a>
  <a href="https://github.com/tela-lang/tela/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@tela-lang/tela" alt="license MIT"></a>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs welcome">
  <a href="https://tela-lang.github.io/tela"><img src="https://img.shields.io/badge/docs-online-34786e" alt="docs"></a>
  <a href="https://github.com/tela-lang/tela/blob/main/SPEC.md"><img src="https://img.shields.io/badge/spec-SPEC.md-blue" alt="language spec"></a>
</p>

<p align="center">
  Write components in <code>.tela</code> files — state, logic, view, and styles all in one place.<br>
  The compiler outputs vanilla JS and scoped CSS. No virtual DOM, no build toolchain, no framework lock-in.
</p>

---

## ✨ Features

- **Single File Components** — state, logic, view, and styles live in one `.tela` file
- **Reactive by default** — Proxy-based state triggers minimal, targeted DOM updates
- **Scoped CSS** — styles compile to unique class names with zero bleed between components
- **Tiny runtime** — ~10KB, zero dependencies, ships as a UMD bundle
- **Backend-agnostic** — works with Spring Boot, Express, Flask, or plain static files
- **Zero config** — no webpack, no bundler; just compile and drop a `<script>` tag

---

## 🚀 Quick Start

```bash
npx @tela-lang/tela init my-app
cd my-app
npm install
npx @tela-lang/tela compile-all components/ --global
open index.html
```

That's it. No config files. No bundler setup. Open the file in a browser and you're live.

---

## 📝 Your first component

**Counter.tela**

```tela
component Counter {
  state count: Number = 0

  function increment() {
    count = count + 1
  }

  function decrement() {
    count = count - 1
  }

  view {
    div {
      style {
        display: "flex"
        flex-direction: "column"
        align-items: "center"
        padding: 32px
        gap: 16px
        border-radius: 12px
        background: "#ffffff"
        box-shadow: "0 4px 24px rgba(0,0,0,0.08)"
      }

      h1 {
        content: "Count: ${count}"
        style { font-size: 48px  color: "#1a1a2e" }
      }

      div {
        style { display: "flex"  gap: 12px }

        button {
          content: "−"
          @click: decrement
          style { padding: "12px 24px"  font-size: 24px  cursor: "pointer"  border-radius: 8px  background: "#ef4444"  color: "#fff"  border: "none" }
        }

        button {
          content: "+"
          @click: increment
          style { padding: "12px 24px"  font-size: 24px  cursor: "pointer"  border-radius: 8px  background: "#22c55e"  color: "#fff"  border: "none" }
        }
      }
    }
  }
}
```

Compile and include:

```bash
npx @tela-lang/tela compile Counter.tela --global
```

```html
<link rel="stylesheet" href="Counter.css">
<script src="https://unpkg.com/@tela-lang/tela@latest/dist/runtime.umd.js"></script>
<script src="Counter.js"></script>
<script>Tela.render(Counter, document.getElementById('app'));</script>
```

---

## 📦 Installation

**Global install** — use `tela` anywhere:
```bash
npm install -g @tela-lang/tela
tela compile MyApp.tela
```

**Project devDependency** — pin to a version:
```bash
npm install --save-dev @tela-lang/tela
npx tela compile MyApp.tela
```

**No install** — run directly with npx:
```bash
npx @tela-lang/tela compile MyApp.tela
```

---

## 🔧 CLI Reference

| Command | Description |
|---|---|
| `tela init [name]` | Scaffold a new project with a starter component |
| `tela compile <file.tela>` | Compile a single component to `.js` + `.css` |
| `tela compile-all <dir>` | Compile every `.tela` file in a directory |

**Options**

| Flag | Description |
|---|---|
| `--global` | Expose the component on `window` (required for plain `<script>` use) |

---

## 🌐 Runtime CDN

**unpkg:**
```html
<script src="https://unpkg.com/@tela-lang/tela@latest/dist/runtime.umd.js"></script>
```

**jsDelivr:**
```html
<script src="https://cdn.jsdelivr.net/npm/@tela-lang/tela@latest/dist/runtime.umd.js"></script>
```

Mount a compiled component onto any DOM node:
```js
Tela.render(MyComponent, document.getElementById('app'));
```

---

## 🏗️ Language Overview

```tela
import Header from "./Header.tela"

component UserDashboard {
  // ── State ────────────────────────────────────────────
  state users:   Array   = []
  state loading: Boolean = false
  state query:   String  = ""

  // ── Props ────────────────────────────────────────────
  prop title: String

  // ── Lifecycle ────────────────────────────────────────
  onMount {
    fetchUsers()
  }

  // ── Functions ────────────────────────────────────────
  async function fetchUsers() {
    loading = true
    response = await fetch("/api/users")
    users    = await response.json()
    loading  = false
  }

  function deleteUser(id) {
    fetchUsers()
  }

  // ── View ─────────────────────────────────────────────
  view {
    div {
      // Render a child component
      Header { title: title }

      // Two-way binding on an input
      input { bind value: query  placeholder: "Search..." }

      if (loading) {
        p { content: "Loading..." }
      } else {
        div {
          for (user in users) {
            div {
              style { display: "flex"  justify-content: "space-between"  padding: 8px }
              span { content: "${user.name}" }
              button {
                content: "Delete"
                @click: deleteUser(user.id)
              }
            }
          }
        }
      }
    }
  }
}
```

### Core syntax at a glance

| Syntax | Purpose |
|---|---|
| `state name: Type = value` | Reactive local state |
| `prop name: Type` | Input from parent |
| `computed name = expr` | Derived value, auto-updates |
| `route path: String` | Reactive URL variable for client-side routing |
| `enum Name { A B C }` | Compile-time constant set |
| `model Name { field: Type }` | Data-shape factory |
| `onMount / onUpdate / onDestroy { }` | Lifecycle hooks |
| `async function name() { }` | Async function with `await` |
| `emit eventName(value)` | Fire a custom event to the parent |
| `bind value: stateVar` | Two-way input binding |
| `@click: fn` | Event handler |
| `if (cond) { } else { }` | Conditional rendering |
| `for (item in list) { }` | List rendering |
| `switch (expr) { case v: ... }` | Switch/case in logic and view |
| `while (cond) { }` | While loop |
| `try { } catch (e) { }` | Error handling |
| `content: "Hello ${name}"` | Text with interpolation |
| `style { prop: value }` | Scoped styles (static → CSS, dynamic → inline) |

**Full language reference:** [SPEC.md](./SPEC.md) · [Docs site](https://tela-lang.github.io/tela)

---

## ☕ Spring Boot Integration

Tela integrates cleanly with any JVM backend. The compiler runs as a Maven plugin step during `generate-resources` — no extra tooling required.

**pom.xml** — auto-compile before the build:
```xml
<plugin>
  <groupId>org.codehaus.mojo</groupId>
  <artifactId>exec-maven-plugin</artifactId>
  <version>3.1.0</version>
  <executions>
    <execution>
      <id>compile-tela</id>
      <phase>generate-resources</phase>
      <goals><goal>exec</goal></goals>
      <configuration>
        <executable>npx</executable>
        <arguments>
          <argument>@tela-lang/tela</argument>
          <argument>compile-all</argument>
          <argument>${project.basedir}/src/main/resources/static/components</argument>
          <argument>--global</argument>
        </arguments>
      </configuration>
    </execution>
  </executions>
</plugin>
```

**index.html** (Thymeleaf template):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="/components/App.css">
</head>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/@tela-lang/tela@latest/dist/runtime.umd.js"></script>
  <script src="/components/App.js"></script>
  <script>Tela.render(App, document.getElementById('app'));</script>
</body>
</html>
```

Run `mvn spring-boot:run` and Maven will compile all `.tela` files automatically before starting the server.

---

## 🌍 Live Demo

**[Spring PetClinic → Tela](https://github.com/tela-lang/tela/tree/main/examples/petclinic-tela)** — a fully functional CRUD app with Owners, Pets, Vets, and Visits, built with Tela + Spring Boot + H2. Clone it, run `mvn spring-boot:run`, and see a complete multi-component Tela app in production form.

---

## 🤝 Contributing

```bash
git clone https://github.com/tela-lang/tela.git
cd tela
npm install
npm test
```

Bug reports, feature requests, and pull requests are all welcome. Open an issue to discuss larger changes before submitting a PR.

---

## 🙏 Acknowledgements

Tela draws inspiration from the best ideas in modern frontend tooling:

- **[Svelte](https://svelte.dev)** — the "compile away the framework" philosophy
- **[Vue.js](https://vuejs.org)** — single-file components and template syntax design
- **[React](https://react.dev)** — virtual DOM diffing and component model
- **Angular** — declarative template syntax and two-way binding

The [Spring PetClinic](https://github.com/spring-projects/spring-petclinic) demo application (© Spring team, Apache 2.0) inspired the example app in `examples/petclinic-tela/`.

---

## 📄 License

MIT © [tela-lang](https://github.com/tela-lang/tela/blob/main/LICENSE)
