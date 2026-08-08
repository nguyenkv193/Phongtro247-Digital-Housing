# MySQL to PostgreSQL migration

The Node backend currently uses raw MySQL queries from `backend/src/config/db.js`. The Java service uses PostgreSQL and Flyway migrations instead of runtime schema creation.

## Initial mapping

| Legacy MySQL concept | PostgreSQL target |
| --- | --- |
| `INT AUTO_INCREMENT` | `BIGSERIAL` / identity-backed `BIGINT` |
| `TINYINT(1)` | `BOOLEAN` |
| money values | `NUMERIC(19, 2)` |
| date/time columns | `TIMESTAMPTZ` or `DATE` where appropriate |
| comma/JSON text fields | `JSONB` (`amenities`, `surroundings`) |
| MySQL foreign keys | PostgreSQL foreign keys with explicit delete behavior |

## Data migration rule

`V1__create_core_schema.sql` is the new schema baseline; it must not be used to overwrite the live MySQL database. Before production cutover:

1. Export MySQL data to a staging snapshot.
2. Normalize empty strings, boolean flags and JSON-like text.
3. Load parent tables before child tables and preserve IDs.
4. Rebuild sequences after import.
5. Compare row counts and business aggregates.
6. Run the Java service in read-only shadow mode before switching writes.
