# Changelog

All notable changes to Tela will be documented here.

## [0.1.0] — 2026-03-08

### Added
- Single-file component syntax (`.tela` files)
- Reactive state with Proxy-based auto-update
- Scoped CSS compilation to unique class names
- Virtual DOM with incremental patching
- `if / else if / else` conditionals in templates and functions
- `for (item in list)` loops
- Two-way binding via `bind value:`
- Event handlers `@click`, `@input` with argument support
- `async` functions with `await fetch()`
- Object literal expressions `{ key: val }` in function bodies
- Lifecycle hooks: `onMount`, `onUpdate`, `onDestroy`
- Props system with `prop name: Type`
- Computed properties and watchers
- `tela init` scaffold command
- `tela compile` and `tela compile-all` CLI commands
- `dist/runtime.umd.js` UMD build (~10KB, zero dependencies)
- CDN distribution via unpkg: `https://unpkg.com/@tela-lang/tela@latest/dist/runtime.umd.js`
- Spring Boot integration via Maven exec plugin
- Spring PetClinic example app (Owners, Pets, Vets, Visits CRUD)
- Documentation site built with Tela itself
