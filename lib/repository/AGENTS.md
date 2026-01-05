The `repository` layer is the only part of code that
should be concerned with database access.

```
 ┌─────┐   ┌────────┐   ┌────────────┐   ┌──────────┐
 │     │   │        │   │            │   │          │
 │ App ┼──►│ Models ┼──►│ Repository ┼──►│ Database │
 │     │   │        │   │            │   │          │
 └─────┘   └────────┘   └────────────┘   └──────────┘
```

Part of the access concern is the "how", which involves
drizzle for type-safe query building.

Drizzle conveniently allows for schemas-as-typescript-code,
however the rest of the application should be fully unaware of the fact that drizzle is even used, and work with `models` instead, which are the
API into the `repository` layer.

This decouples the application from drizzle, and even the postgres,
and in-theory, the `repository` layer should be the only layer that changes,
should the application itself move away from drizzle or postgres.
