# API compatibility map

The Java service keeps the legacy HTTP paths so the frontend can change its
`NEXT_PUBLIC_API_URL` without rewriting every feature at once.

| Legacy area | Java endpoint boundary | Status |
| --- | --- | --- |
| Auth | `/api/auth/register`, `/api/auth/login` | Migrated |
| User profile | `/api/user/**` | Migrated |
| Locations | `/api/locations/**` | Migrated |
| Listings | `/api/listings/**` | Query and owner write flows migrated |
| Favorites | `/api/favorites/**` | Migrated |
| Reviews | `/api/reviews/**` | Migrated |
| Tenants | `/api/tenants/**` | Migrated |
| Contracts | `/api/contracts/**` | Migrated |
| Incidents | `/api/incidents/**` | Migrated with reporter/tenant separation |
| Notifications | `/api/notifications/**` | Migrated |
| Transactions | `/api/transactions/history` | Migrated |
| Video requests | `/api/videos/**` | Owner request flow migrated |
| HOT requests | `/api/hot-listings/**` | Owner request/cancel flow migrated |
| MoMo | `/api/payment/momo/**` | Migrated with env config and idempotent callback |
| Listing reports | `/api/listing-reports/**`, `/api/admin/complaints/**` | User and complaint status flows migrated |
| Landlord reports | `/api/reports`, `/api/expenses` | Migrated |
| Admin core | `/api/admin/users`, `/api/admin/adminlistings`, `/api/admin/revenues`, `/api/admin/reports` | Migrated |
| Admin promotion processing | Video/HOT request approval and rejection | Migrated |
| Google/email verification | `/api/auth/google*`, `/api/email-verification/**` | Next slice |
| OG metadata | `/og/**` | Next slice |

The old backend remains available locally for comparing response payloads and
for data migration scripts. It should not be copied into `BE` or imported as a
runtime dependency.
