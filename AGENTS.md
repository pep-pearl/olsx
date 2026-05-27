# AGENTS.md

## Core Rules

- Follow the nearest applicable `AGENTS.md`.
- Load only the minimum rule files needed for the current task.
- Do not read every file in `docs/rules/` by default.
- Do not apply task-specific prompts unless the user explicitly references them.
- Prefer small, targeted changes over broad refactors.
- If exact files are provided by the user, start from those files.
- If relevant files are unclear, follow `docs/rules/context-navigation.md`.

## Always Read

- `docs/rules/context-navigation.md`

## Read Only When Explicitly Relevant

- `docs/rules/ai-navigation-maintenance.md`
  - Use only when asked to create, update, audit, or maintain AI navigation metadata such as `AI_INDEX.md` or `@ai-*` file headers.
  - Also use after code changes if the changed files affect routing, page structure, domain ownership, feature boundaries, map/GIS architecture, API/data fetching structure, or other information already documented in `AI_INDEX.md`.

## Post-Change AI Navigation Check

After modifying code, check whether the changes should be reflected in AI navigation metadata.

Check these files only when relevant:

- `AI_INDEX.md`
- file-level `@ai-*` comments
- `docs/rules/*`
- `AGENTS.md`

Update `AI_INDEX.md` or file-level `@ai-*` comments when the change affects:

- entry points
- boundaries
- major feature ownership
- domain
- important flows
- state management
- API/data fetching structure
- map/GIS architecture
- files that future agents should read first

## Post-Change Documentation Check

After modifying code, check whether public documentation needs to be updated.

Check these files only when relevant:

- `README.md`
- `docs/api/*`
- `docs/guides/*`
- `docs/examples/*`
- `docs/rules/documentation-maintenance.md`

Update documentation when the change affects:

- public exports
- component props
- hook return values
- expected behavior
- usage examples
- recommended patterns
- lifecycle behavior
- first-time setup

All Documentation should be updated by Korean.

## Read Only When Explicitly Relevant

- `docs/rules/documentation-maintenance.md`
  - Use when adding, updating, auditing, or restructuring public documentation.
  - Also use after code changes if the changed files affect public exports, usage examples, props, lifecycle behavior, recommended patterns, or README content.
