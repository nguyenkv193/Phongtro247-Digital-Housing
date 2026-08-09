# Backend architecture

## Module boundaries

The root package is intentionally divided into five layers:

- `config`: framework configuration such as Jackson, security, CORS and static resources.
- `bootstrap`: startup, seed and lifecycle orchestration.
- `common`: reusable cross-cutting runtime concerns.
- `infrastructure`: shared technical adapters and external integrations.
- `modules`: business bounded contexts.

Each business capability lives under `modules/<capability>` and is divided into:

- `controller`: HTTP controllers. It owns the external HTTP contract.
- `service`: use cases, transaction boundaries and module-specific ports.
- `dto`: typed request and response contracts used by the module.
- `entity`: entities, value objects and persistence-facing domain rules.
- `repository`: module-local persistence adapters and Spring Data repositories.
  Shared external integrations belong to the root `infrastructure` package.

The `common` package contains only cross-cutting concerns. New code should not
access another module's repository directly; cross-module access should go
through an application service or a small query port. A few early migration
slices still have direct repository dependencies so legacy response contracts
can be reproduced quickly; these dependencies are isolated candidates for
ports during hardening.

For example, Google OAuth adapters belong under
`infrastructure/google`, while the authentication use case and its provider
port remain inside `modules/auth/service`.

## Message conventions

User-facing messages and response codes are defined in
`common/message/MessageCatalog.java`:

- `ERR-xxx`: validation, business and technical errors.
- `SUC-xxx`: successful operations.
- `WAR-xxx`: recoverable or already-processed outcomes.

Application code must use `MessageCatalog` constants or templates. Response
objects expose both `code` and `message` so clients can branch on stable codes
without parsing text. User-facing message text is standardized in Vietnamese;
technical protocol values such as JWT, JSON and MoMo remain unchanged where
they are part of an external contract.

## Current modules

`auth`, `users`, `locations`, `listings`, `favorites`, `reviews`, `contracts`,
`tenants`, `incidents`, `notifications`, `payments`, `transactions`,
`promotions`, `listingreports`, `landlordreports`, `revenues` and `admin` are
present in `BE`.

The HTTP contracts retain the legacy `/api/...` paths and snake_case response
fields where the current frontend depends on them. New features should prefer
typed request/response records and explicit use-case services rather than SQL
in controllers.

## Runtime boundaries

- PostgreSQL is the source of truth; Hibernate validates the schema and Flyway owns changes.
- JWT is stateless. Public listing reads and authentication are unauthenticated; owner workflows require a bearer token.
- Uploaded files go through `LocalFileStorageService`; this boundary can later be replaced by S3/MinIO.
- MoMo callbacks are signature-checked and transactions are keyed by `external_id`, preventing duplicate account credits.

## Next migration slice

Email verification/Google login and OG metadata remain separate so the public
marketplace stays stable while those boundaries are migrated later.
