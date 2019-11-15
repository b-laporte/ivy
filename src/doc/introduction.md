

# Simple
    - Relies on JavaScript: no specific or convoluted syntax to support control statements, loops, expressions, import/export or local variables
    - No implicit behaviors: each element of syntax can be mapped to a single behaviors - no need to learn exceptions
    - Explicit: every unconventional behavior is always associated to a symbol or a prefix (e.g. "*", ".", "@" or "$") in order to be able to easily look-up for information.
    - Easy debug
    - Highly composable syntax: what is learned in one context can be used in another context (e.g. parameters, decorators, etc.)
    - Simple components as functions, rich components with optional controller classes
    - Component API is easily and clearly expressed

# Rich semantics
    - Templates
    - Components
    - Decorators
    - Container components
    - Container components with multiple, hierarchical contents

# Typescript-native
    - Designed for typescript
    - Fully typed APIs (components and decorators)

# Efficient
    - Deferred component content
    - Version tracking / "on push"
    - Async (todo)
    - Error messages

# Reactive


# Documents
    - documents = template execution output

    - rename xdf? -> XJS document fragment
    - server-side, client-side or build-time generation
        Server-side: dynamic content / CMS / A-B testing
        Client-side: dynamic page structure (e.g. forms)
    - safe (no-JS)
    - can be generated through any technology (e.g. Java, Python or Go / doesn't require nodeJS)
    - pre-processor support
    - support of most XJS features except JS
    