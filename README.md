# clerk0

_aka clark the builder_

<picture >
  <source media="(prefers-color-scheme: dark)" srcset="public/karl.png">
  <source media="(prefers-color-scheme: light)" srcset="public/clark.png">
  <img alt="Fallback image description" src="public/clark.png" width="200">
</picture>

## What is this?

This is a demo application (inspired by leading genAI apps like V0, Claude, etc.) to demonstrate programmatic Clerk resource access, including but not limited to `application` creation with PK & SK retrieval, and `application` transfers to other users' workspaces.

This is made possible by the [Clerk Platform API](https://clerk.com/docs/reference/platform-api) (currently in private beta)

## Contributing

> [!IMPORTANT]
> This is a work in progress.

Populate environment variables

```env
#.env
OPEAI_API_KEY=
ANTHROPIC_API_KEY=
CLERK_PLATFORM_API_BASE_URL=
CLERK_PLATFORM_ACCESS_TOKEN=
```

Install deps

```
bun i
```

Generate the api client

```bash
bunx @hey-api/openapi-ts \
  -i openapi.json \
  -o lib/api \
  -c @tanstack/react-query
```

Get vercel token for Sandbox access

```bash
vercel env pull
```

Run the app

```
bun run dev
```

---

This project was cloned from https://oss-vibe-coding-platform.vercel.app/
