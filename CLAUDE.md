# SureSightCC - Claude Code Instructions

## Security Requirements

All code written for this project MUST follow the secure coding guidelines defined in `.claude/security-guide.md`. Read and apply that guide when working on any code in this project.

### Key Security Rules (Always Apply)

- **Access Control**: Verify resource ownership at the data layer on every request. Use UUIDs, not sequential IDs. Return 404 (not 403) for unauthorized resource access to prevent enumeration.
- **XSS Prevention**: Sanitize all user-controllable input. Use framework escaping (React JSX). Apply CSP headers. Use DOMPurify for any rich text/HTML rendering.
- **CSRF Protection**: Protect all state-changing endpoints with CSRF tokens. Use `SameSite=Strict` or `Lax` on cookies. Set `Secure` and `HttpOnly` flags.
- **No Client-Side Secrets**: Never expose API keys, DB connection strings, JWT secrets, or sensitive PII in client-side code, JS bundles, or `VITE_`/`REACT_APP_` env vars.
- **SQL Injection**: Always use parameterized queries or ORM methods. Never concatenate user input into queries. Whitelist ORDER BY columns.
- **File Uploads**: Validate magic bytes + extension. Rename to UUID. Store outside webroot. Serve with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`.
- **SSRF**: Allowlist outbound request domains. Block internal/metadata IPs (`169.254.169.254`). Validate resolved DNS before requests.
- **Path Traversal**: Never use user input directly in file paths. Canonicalize and validate against a base directory.
- **Open Redirects**: Only allow relative URLs or allowlisted domains for redirects. Block `//`, `@`, `javascript:` and encoding bypass techniques.
- **Passwords**: Hash with Argon2id, bcrypt, or scrypt. Minimum 8 characters. No artificial max length.
- **Error Handling**: Never leak stack traces, SQL errors, or internal details to users in production.
- **Security Headers**: Apply HSTS, CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

When unsure, choose the more restrictive/secure option and document the security consideration in a comment.
