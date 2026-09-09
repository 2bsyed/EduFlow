# Phase 2 Report: Authentication & Authorization

## FastAPI Implementation
- Configured **JWT Authentication** in `/app/core/security.py` using `python-jose` and `passlib[bcrypt]`.
- Implemented `/api/v1/auth/login` endpoint in `/app/api/auth.py`.
- Added **Rate Limiting/Lockout Logic**: Tracks failed login attempts per email in-memory. After 5 failed attempts, the email is locked out for 15 minutes.
- Configured **CORS** in `main.py` allowing access from Next.js (http://localhost:3000 and http://127.0.0.1:3000).
- Created a `get_current_user` FastAPI dependency to authenticate protected routes and extract `id`, `role`, and `instituteId`.

## Next.js Implementation
- Created a **Next.js Route Handler** (`/api/auth/login`) that acts as an authentication bridge to FastAPI.
- It securely sets the returned `access_token` and `refresh_token` in **HTTP-only, secure cookies** (`auth_token`, `auth_refresh_token`).
- Updated `middleware.ts` to decode the JWT payload natively without the `jose` library (just decoding base64 to extract role) for route protection. Preserved all existing role-based redirects.
- Added a `logout` route (`/api/auth/logout`) to clear cookies.
- Created `src/lib/api.ts` utility providing `getAuthToken()` and `getAuthHeaders()` to easily attach tokens to subsequent backend requests from Server Components.

## Testing & Validation
- Validated login correctly handles credentials and invalid attempts.
- Verified rate limiting throws `429 Too Many Requests` after 5 failed attempts.
- Verified cookies are correctly set and role-based redirects function properly.
- All routing boundaries (`/dashboard` for OWNER, `/teacher` for TEACHER, `/student` for STUDENT) remain intact based on the decoded JWT role.
