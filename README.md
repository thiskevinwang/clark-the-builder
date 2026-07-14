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
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
OPENAI_API_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
CLERK_PLATFORM_ACCESS_TOKEN=

# Optional: enables the Vercel Sandbox integration
VERCEL_TOKEN=
VERCEL_TEAM_ID=
VERCEL_PROJECT_ID=
```

Install deps

```
bun i
```

Generate the api client

```bash
bun run api:generate
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
