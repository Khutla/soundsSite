# Application Changelog

## [Unreleased]

### Added

- Initial living system specification for the MkhSounds storefront and admin system.
- Documented the current Next.js App Router architecture, Prisma schema, admin auth flow, product/category management, marketplace listing flow, and AI chat integration.
- Documented the current upload and image serving routes for storefront and admin assets.

### Changed

- Documented the application as implemented in the current codebase rather than aspirational product plans.
- Recorded the default admin seeding and JWT-based administrative access patterns, including their operational security implications.

### Fixed

- Removed the hardcoded default admin credential fallback from the login route and Prisma seed process.
- Replaced the insecure dev-only JWT secret fallback with a strict secret requirement.
- Added an explicit environment-driven bootstrap flow for admin credentials via `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Normalized marketplace image payload handling to match the SQLite schema by storing JSON arrays as strings.
- Corrected nullable marketplace fields and type mismatches so the project compiles and lint-checks cleanly.

### Removed

- N/A

### Database

- Documented the current SQLite-backed Prisma schema and model relationships.
- Recorded the `SecondHandProduct` model used by the marketplace approval workflow.

### Security

- Captured the current admin authentication model, cookie-based JWT flow, and noted the default seeded admin credential pattern as a security risk.
- Recorded the current upload restrictions and API protections in place for admin-only routes.
