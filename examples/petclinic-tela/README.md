# Spring PetClinic — Tela

A fully functional CRUD application built with **Tela** + **Spring Boot** + **H2**.
Demonstrates route parameters, keyed list rendering, async data fetching, and multi-component composition — all in `.tela` files served by a Spring Boot backend.

---

## What's inside

| Feature | Where |
|---|---|
| Client-side routing with route params | `App.tela` — `route path`, `route params`, `/owners/:id`, `/pets/:id` |
| Owner list + detail view | `Owners.tela`, `OwnerDetail.tela` |
| Pet list + detail view with visits | `Pets.tela`, `PetDetail.tela` |
| Veterinarians card grid | `Vets.tela` |
| All visits log | `Visits.tela` |
| Keyed list reconciliation | `key: o.id` / `key: v.id` on every `for` loop row |
| Spring Boot REST API | `OwnerController`, `PetController`, `VetController`, `VisitController` |
| In-memory database | H2, seeded on startup by `DataSeeder` |

---

## Quick start

**Prerequisites:** Java 17+, Node.js 18+ (for the Tela compiler)

```bash
cd examples/petclinic-tela
mvn spring-boot:run
```

Maven compiles all `.tela` files to `.js` + `.css` automatically during `generate-resources`, then starts the server. Open http://localhost:8080.

---

## Frontend dev with live reload

To iterate on `.tela` components without restarting Maven, run the Tela dev server alongside Spring Boot:

```bash
# Terminal 1 — Spring Boot (skip tela compile step to avoid conflict)
mvn spring-boot:run -Dexec.skip=true

# Terminal 2 — Tela dev server (compiles + watches + live reloads)
npx @tela-lang/tela dev src/main/resources/static/components/ \
  --root src/main/resources/static \
  --port 3001 \
  --global
```

Then open http://localhost:3001 for instant live reload on every `.tela` save.

---

## Project structure

```
src/main/
├── java/com/example/petclinic/
│   ├── controller/          REST API endpoints
│   ├── model/               JPA entities (Owner, Pet, Vet, Visit)
│   ├── repository/          Spring Data JPA repos
│   ├── DataSeeder.java      Seeds sample data on startup
│   └── HomeController.java  Serves index.html for all SPA routes
└── resources/
    ├── static/
    │   ├── components/      .tela source files (compiled to .js + .css)
    │   └── tela/            Tela runtime bundle
    └── templates/
        └── index.html       SPA shell — loads compiled components
```

---

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/owners` | List all owners |
| `POST` | `/api/owners` | Create owner |
| `GET` | `/api/owners/{id}` | Get owner by ID |
| `PUT` | `/api/owners/{id}` | Update owner |
| `DELETE` | `/api/owners/{id}` | Delete owner |
| `GET` | `/api/owners/{id}/pets` | List pets for an owner |
| `GET` | `/api/pets` | List all pets |
| `POST` | `/api/pets` | Create pet |
| `GET` | `/api/pets/{id}` | Get pet by ID |
| `PUT` | `/api/pets/{id}` | Update pet |
| `DELETE` | `/api/pets/{id}` | Delete pet |
| `GET` | `/api/pets/{id}/visits` | List visits for a pet |
| `GET` | `/api/vets` | List all vets |
| `POST` | `/api/vets` | Create vet |
| `DELETE` | `/api/vets/{id}` | Delete vet |
| `GET` | `/api/visits` | List all visits |
| `POST` | `/api/visits` | Create visit |
| `DELETE` | `/api/visits/{id}` | Delete visit |
