// Tela Language Documentation Data
// Tela is inspired by Vue.js (SFCs), Svelte (compiled approach), and React (vdom).
// Spring PetClinic example inspired by https://github.com/spring-projects/spring-petclinic
window.TELA_DOCS = {
  // Introduction
  introFeatures: `\u2022 Single File Components \u2014 state, logic, view in one .tela file
\u2022 Reactive by default \u2014 state changes re-render minimal DOM
\u2022 Scoped CSS \u2014 compiled to unique class names, no leakage
\u2022 Tiny runtime \u2014 ~5KB vanilla JS, no dependencies
\u2022 Backend-agnostic \u2014 works with Spring Boot, Express, Flask, or any server`,

  // Getting Started
  installCode: `# Install globally
npm install -g @tela-lang/tela

# Or use without installing
npx @tela-lang/tela init my-app`,

  cliCode: `# Compile a single file
tela compile MyComponent.tela --global

# Compile all .tela files in a directory
tela compile-all src/components/ --global

# Or without global install:
npx @tela-lang/tela compile-all src/components/ --global`,

  mountCode: `<!-- 1. Include CSS -->
<link rel="stylesheet" href="/components/App.css">

<!-- 2. Tela Runtime via CDN -->
<script src="https://unpkg.com/@tela-lang/tela@latest/dist/runtime.umd.js"></script>

<!-- 3. Compiled components -->
<script src="/components/App.js"></script>

<!-- 4. Mount -->
<script>
  Tela.render(App, document.getElementById('app'));
</script>`,

  // Component Anatomy
  anatomyCode: `component Counter {
  // 1. Reactive state
  state count: Number = 0

  // 2. Props from parent
  prop label: String

  // 3. Functions
  function increment() {
    count = count + 1
  }

  // 4. Lifecycle
  onMount {
    console.log("Counter mounted")
  }

  // 5. View
  view {
    div {
      style { text-align: "center" padding: 24px }
      h2 { content: "\${label}: \${count}" }
      button {
        content: "Increment"
        @click: increment
        style { padding: "8px 20px" cursor: "pointer" }
      }
    }
  }
}`,

  // Reactive State
  stateCode: `component Timer {
  state seconds: Number = 0
  state running: Boolean = false

  function start() { running = true }
  function stop()  { running = false }
  function reset() { seconds = 0 }

  view {
    div {
      h1 { content: "\${seconds}s" }
      button { content: "Start" @click: start }
      button { content: "Stop"  @click: stop  }
      button { content: "Reset" @click: reset }
    }
  }
}`,

  // Props
  propsCode: `component Badge {
  prop label: String
  prop color: String

  view {
    span {
      style {
        background: color
        color: "white"
        padding: "4px 10px"
        border-radius: 4px
        font-size: "13px"
        font-weight: "600"
      }
      content: "\${label}"
    }
  }
}`,

  propsUsageCode: `// In a parent component:
view {
  div {
    Badge { label: "Active"   color: "#34786e" }
    Badge { label: "Pending"  color: "#e67e22" }
    Badge { label: "Archived" color: "#95a5a6" }
  }
}`,

  // Template Syntax
  templateCode: `view {
  div {
    style { padding: 20px background: "white" border-radius: 8px }

    h1 { content: "Hello, \${name}!" }
    p  { content: "You have \${count} messages." }

    img { src: "/avatar.png" alt: "User avatar" }

    a {
      href: "/profile"
      content: "View profile"
    }
  }
}`,

  styleCode: `div {
  style {
    padding: 20px          /* number + unit -> static CSS */
    background: "#ffffff"  /* string literal -> static CSS  */
    opacity: opacityLevel  /* state variable -> inline style */
    border: "1px solid #e0e0e0"
  }
}`,

  // Events
  eventsCode: `component Form {
  state value: String = ""

  function save() {
    console.log(value)
  }

  function clear() {
    value = ""
  }

  view {
    div {
      input { bind value: value }

      // Simple function reference
      button { content: "Save"  @click: save  }

      // Call with argument
      button { content: "Clear" @click: clear }
    }
  }
}`,

  eventsArgCode: `for (item in items) {
  div {
    span { content: "\${item.name}" }
    button {
      content: "Delete"
      @click: deleteItem(item.id)
    }
  }
}`,

  // Control Flow
  ifCode: `if (isLoggedIn) {
  div { content: "Welcome back!" }
} else if (isPending) {
  div { content: "Verifying..." }
} else {
  button { content: "Login" @click: login }
}`,

  forCode: `component TodoList {
  state todos: Array = []

  view {
    div {
      for (todo in todos) {
        div {
          style { display: "flex" gap: 8px padding: 8px }
          span   { content: "\${todo.title}" }
          button { content: "Done" @click: complete(todo.id) }
        }
      }
    }
  }
}`,

  // Two-way Binding
  bindCode: `component SearchBar {
  state query: String = ""
  state results: Array = []

  onMount { search() }

  async function search() {
    response = await fetch("/api/search?q=" + query)
    results = await response.json()
  }

  view {
    div {
      input {
        bind value: query
        placeholder: "Search..."
        @input: search
      }
      p { content: "\${results.length} results" }
      for (r in results) {
        div { content: "\${r.title}" }
      }
    }
  }
}`,

  // Async & Data Fetching
  asyncCode: `component UserList {
  state users: Array = []
  state loading: Boolean = true
  state error: String = ""

  onMount {
    loadUsers()
  }

  async function loadUsers() {
    loading = true
    response = await fetch("/api/users")
    users = await response.json()
    loading = false
  }

  async function createUser(name) {
    response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name })
    })
    newUser = await response.json()
    users = users.concat([newUser])
  }

  async function deleteUser(id) {
    await fetch("/api/users/" + id, { method: "DELETE" })
    response = await fetch("/api/users")
    users = await response.json()
  }

  view {
    div {
      if (loading) {
        p { content: "Loading..." }
      } else {
        for (u in users) {
          div { content: "\${u.name}" }
        }
      }
    }
  }
}`,

  // Child Components
  childCode: `component App {
  state page: String = "home"

  function goHome()  { page = "home"  }
  function goAbout() { page = "about" }

  view {
    div {
      Nav { onGoHome: goHome onGoAbout: goAbout }

      if (page === "home") {
        Home {}
      } else {
        About {}
      }
    }
  }
}`,

  childNavCode: `component Nav {
  prop onGoHome:  Function
  prop onGoAbout: Function

  view {
    nav {
      button { content: "Home"  @click: onGoHome  }
      button { content: "About" @click: onGoAbout }
    }
  }
}`,

  // Lifecycle
  lifecycleCode: `component DataWidget {
  state data: Array = []

  onMount {
    // Called once after first render
    loadData()
  }

  onUpdate {
    // Called after every re-render
    console.log("re-rendered")
  }

  onDestroy {
    // Called when component is removed from DOM
    console.log("cleanup")
  }

  async function loadData() {
    response = await fetch("/api/data")
    data = await response.json()
  }

  view {
    div {
      for (d in data) {
        p { content: "\${d.value}" }
      }
    }
  }
}`,

  // Spring Boot
  mavenCode: `<plugin>
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
          <argument>\${project.basedir}/src/main/resources/static/components</argument>
          <argument>--global</argument>
        </arguments>
      </configuration>
    </execution>
  </executions>
</plugin>`,

  springHtmlCode: `<!-- src/main/resources/templates/index.html -->
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/components/App.css">
</head>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/@tela-lang/tela@latest/dist/runtime.umd.js"></script>
  <script src="/components/Home.js"></script>
  <script src="/components/App.js"></script>
  <script>Tela.render(App, document.getElementById('app'));</script>
</body>
</html>`,
};
