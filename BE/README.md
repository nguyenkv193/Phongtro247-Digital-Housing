# PhongTro247 Digital Housing Backend

Java/Spring Boot backend migration for the digital housing marketplace.

`BE` is the new backend boundary. The old Node/Express application in
`../backend` is kept locally as a migration reference and is not imported by
this project.

## Stack

- Java 21
- Spring Boot 3.5
- Spring Web, Validation, Security and Data JPA
- PostgreSQL
- Flyway database migrations
- Stateless JWT authentication

## Structure

```text
src/main/java/com/phongtro247/housing
├── config        # framework configuration
├── bootstrap     # startup, seed and lifecycle orchestration
├── common        # API primitives, errors, security and cross-cutting concerns
├── infrastructure # shared technical adapters and external integrations
├── modules       # business modules
│   ├── auth
│   ├── users
│   ├── locations
│   └── listings
└── HousingApplication.java
```

The old Node/Express backend remains in `../backend` as a read-only migration reference. New modules must not import code from it.

Base package responsibilities:

- `config`: Jackson, security, CORS and static resource configuration.
- `bootstrap`: application startup, seed and lifecycle orchestration.
- `common`: cross-cutting API, error, security runtime and storage utilities.
- `infrastructure`: shared technical adapters and external integrations such as Google OAuth.
- `modules`: business bounded contexts and their use cases.

## Message convention

Application messages are centralized in
`common/message/MessageCatalog.java`. Message codes use the format
`ERR-xxx` for errors, `SUC-xxx` for successful operations and `WAR-xxx` for
warnings. API responses expose both `code` and `message`; feature code must use
the catalog instead of hard-coded user-facing text.

## Migrated modules

`auth`, `users`, `locations`, `listings`, `favorites`, `reviews`, `tenants`,
`contracts`, `incidents`, `notifications`, `transactions`, `promotions`,
`listingreports`, `landlordreports`, `revenues`, `admin` and `payments` follow
the `api / application / domain` layout. A module may keep its own persistence
adapter under `infrastructure`; shared external integrations live in the root
`infrastructure` package.
Controllers translate HTTP only; application services own use cases and
transaction boundaries; repositories stay inside their module.

## Run locally

1. Start PostgreSQL:

   ```powershell
   docker compose up -d postgres
   ```

2. Copy `.env.example` to `.env`, then set the real PostgreSQL password and a
   random `JWT_SECRET`. Spring Boot loads this optional file automatically.

3. If PostgreSQL is installed locally with another database/user, update
   `DB_URL`, `DB_USERNAME` and `DB_PASSWORD` in `.env`; the Docker compose
   defaults are only `postgres/postgres`.

4. Start the backend:

   ```powershell
   mvn spring-boot:run
   ```

The service starts on `http://localhost:5000`. Flyway applies the PostgreSQL
migrations on first startup (`V1` core schema, `V2` incident workflow, `V3`
payment idempotency fields).

## Verify

```powershell
mvn verify
```

The API keeps the existing URL shapes for authentication, users, locations,
listings, favorites, reviews, tenants, contracts, notifications, transactions,
incidents, promotions and MoMo payments so the Next.js frontend can switch
from the Node backend incrementally.

## Next migration slice

Email verification/Google login and OG metadata remain separate follow-up
bounded contexts.
