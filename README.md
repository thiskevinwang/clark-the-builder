# clerk0, aka clark the builder

![](./docs//e7963146-2ee3-48fd-b6a6-574531e7059c.png)

---

Generating API Client

```
bunx @hey-api/openapi-ts \
  -i openapi.json \
  -o lib/api \
  -c @hey-api/client-fetch
```

Env vars:

```env
CLERK_PLATFORM_API_BASE_URL=https://api.clerk.com/v1
CLERK_PLATFORM_ACCESS_TOKEN=

# Created by Vercel CLI
VERCEL_OIDC_TOKEN=

ANTHROPIC_API_KEY=

DB_HOST=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=postgres
```

---

This project was cloned from https://oss-vibe-coding-platform.vercel.app/
