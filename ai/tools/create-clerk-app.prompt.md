Use this tool to create a new Clerk application for the project. This will provision a Clerk app with development credentials (publishable key and secret key) that can be used to add authentication to the application.

## When to Use This Tool

Use this tool when:

1. The user explicitly asks for authentication functionality (e.g., "add login", "add authentication", "add user management")
2. The user mentions Clerk specifically
3. The user wants to build an app with user accounts, sign-in, sign-up, or protected routes
4. Building a SaaS application that needs user authentication

## What This Tool Does

1. Creates a new Clerk application via the Clerk Platform API
2. Provisions a development instance automatically
3. Returns the publishable key (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) and secret key (CLERK_SECRET_KEY)
4. These credentials should be passed as environment variables when creating the sandbox

## Workflow

1. Call this tool BEFORE creating the sandbox when authentication is needed
2. Use the returned keys as environment variables when calling Create Sandbox

## When NOT to Use This Tool

Skip using this tool when:

1. The user hasn't requested any authentication features
2. A Clerk app has already been created in this session
3. The user explicitly wants a different auth solution (e.g., NextAuth, Auth0)
4. Building a simple static site without user accounts

## Best Practices

- Choose a descriptive name + petname for the Clerk app based on what the user is building: e.g. B2B SaaS App purple-cow
- If specified, choose a template slug (`b2b-saas`, `waitlist`)
- Always create the Clerk app BEFORE creating the sandbox so the env vars can be set
- After creating the app, remind the user to set up Clerk middleware and providers in their code
