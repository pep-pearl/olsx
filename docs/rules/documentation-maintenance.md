# Documentation Maintenance Rule

## Purpose

Use this rule only when the task explicitly asks to create, update, audit, or improve public documentation.

Also use this rule after code changes when the change may affect public usage.

Public documentation includes:

- `README.md`
- `docs/api/*`
- `docs/guides/*`
- `docs/examples/*`

This rule is separate from AI navigation metadata.  
Use `docs/rules/ai-navigation-maintenance.md` for `AI_INDEX.md` and file-level `@ai-*` comments.

## Documentation Layers

- `README.md`: project overview, installation, shortest working example, major feature links
- `docs/api/*`: API-specific usage, props, lifecycle, notes, related APIs
- `docs/guides/*`: task-based workflows and recommended usage patterns
- `docs/examples/*`: copy-pasteable examples
- `AI_INDEX.md`: AI navigation only, not public documentation

## What To Update

### Update `README.md` when:

- installation changes
- quick-start usage changes
- a new major feature should be visible to first-time users
- the project positioning changes
- documentation links change

### Update `docs/api/*` when:

- an exported component, hook, type, or factory is added, removed, or changed
- props or return values change
- lifecycle behavior changes
- default behavior changes
- public examples for that API become outdated

### Update `docs/guides/*` when:

- a recommended usage pattern changes
- a workflow uses multiple APIs together
- a feature needs explanation beyond props
- performance, events, drawing, overlays, or custom UI patterns change

### Update `docs/examples/*` when:

- a feature is added
- an example becomes outdated
- README examples become too long
- a common usage pattern should be copy-pasteable

## Do Not Update Public Docs For

- internal-only refactors
- private helper changes
- test-only changes
- formatting-only changes
- file moves that do not affect public imports or usage
- experimental code that is not exported or recommended

## Documentation Style

- Prefer official-doc style over blog style.
- Start with the simplest working example.
- Explain public behavior, not internal implementation details.
- Keep examples small and copy-pasteable.
- Use TypeScript examples by default.
- Mention lifecycle or performance notes only when they affect usage.
- Link to related docs instead of duplicating long explanations.
- Do not document internal files unless they are intentionally exposed.

## API Doc Template

````md
# API Name

## Overview

Short explanation.

## Import

```tsx
import { APIName } from "olsx";
```
````

## Basic Example

```ts
// minimal working example
```

## Props / Options

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |

## Behavior

Explain mount/update/unmount behavior if relevant.

## Notes

Usage constraints or caveats.

## Related

- ...

## Guide Doc Template

````md
# Guide Name

## Goal

What this guide helps users do.

## When To Use

When this pattern is recommended.

## Example

```tsx
// working example
```
````

## Explanation

Short explanation.

## Tradeoffs

Only if relevant.

## Related

- ...

## Required Summary

After documentation-related work, include:

```txt
[DOCUMENTATION_MAINTENANCE_SUMMARY]

Docs impact:
- [docs-required/docs-optional/docs-not-needed]

Updated:
- ...

README.md:
- updated / unchanged
- reason:

API docs:
- updated / unchanged
- reason:

Guides:
- updated / unchanged
- reason:

Examples:
- updated / unchanged
- reason:

AI navigation:
- updated / unchanged
- reason:
```

## AI Documentation Navigation

Documentation should be optimized for both humans and AI agents.

When creating or updating documentation, include lightweight AI navigation metadata.

Use metadata only for:

- `docs/api/*`
- `docs/guides/*`
- `docs/examples/*`

Do not add metadata to `README.md`.

Metadata should help future agents:

- find relevant documents
- identify related APIs
- avoid scanning unrelated files
- follow usage flows
- preserve terminology consistency

---

### Document Header Format

Place at the top of each documentation file.

```md
---
title: OLSXVectorLayer

@ai-type: api
@ai-domain: vector-layer
@ai-entry: false

@ai-keywords:
- vector
- layer
- feature
- draw
- events

@ai-related:
- docs/api/map.md
- docs/guides/drawing.md
- docs/examples/vector-markers.md

@ai-read-next:
- src/layers/olsx-vector-layer/index.ts
- src/layers/olsx-vector-layer/components/OLSXVectorLayer.tsx

@ai-tags:
- public-api
- stable
- compound-component

---
```

---

### Metadata Rules

#### `@ai-type`

Required.

Allowed:

- api
- guide
- example
- architecture
- migration

---

#### `@ai-domain`

Required.

Examples:

- map
- vector-layer
- controls
- overlay
- drawing
- hooks
- performance
- architecture

---

#### `@ai-keywords`

Required.

Rules:

- 3–10 keywords
- public naming preferred
- include exports
- include common search terms
- avoid implementation details

Good:

```txt
vector
feature
hover
selection
draw
```

Bad:

```txt
useRef
state
internal
```

---

#### `@ai-related`

Optional.

Link related documentation.

Prefer docs over source.

---

#### `@ai-read-next`

Optional.

Only include:

- entry points
- exported modules
- examples

Avoid deep internal files.

---

#### `@ai-tags`

Optional.

Allowed:

```txt
public-api
stable
experimental
headless
compound
performance-sensitive
advanced
migration
deprecated
```

Avoid custom tags unless repeated.

---

### Documentation Navigation Maintenance

Update metadata when:

- public exports change
- examples move
- terminology changes
- guides split
- document ownership changes

Do not update metadata for:

- typo fixes
- formatting
- small wording updates

---

### Search Priority

Documentation lookup order:

1. title
2. @ai-type
3. @ai-domain
4. @ai-keywords
5. @ai-related
6. body content

```

```
