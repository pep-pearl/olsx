# AI Navigation Maintenance Rule

## Purpose

Use this rule only when the task explicitly asks to create, update, audit, or improve AI navigation metadata.

Also use this rule after code changes when the change may affect how future AI agents should navigate the repository.

AI navigation metadata includes:

- `/AI_INDEX.md`
- file-level `@ai-*` comments
- domain maps
- flow maps
- entry point documentation
- rule-loading guidance in `AGENTS.md`

Do not apply this rule during normal feature work, bug fixes, styling, or refactoring unless the change affects repository navigation or the user explicitly asks for AI navigation maintenance.

## What To Update

### Update `AI_INDEX.md` when:

- a new route/page is added, removed, renamed, or structurally changed
- route-to-page mapping changes
- a major feature folder is added, removed, renamed, or moved
- a domain responsibility changes
- a major flow changes
- state management architecture changes
- API/data fetching architecture changes
- map/GIS architecture changes
- important entry points change
- future agents would need different files to understand the project

### Update file-level `@ai-*` comments when:

- the file purpose changes
- the file becomes or stops being an entry point
- important dependencies change
- the owning domain changes
- the file is newly important for future navigation
- existing `@ai-*` metadata becomes inaccurate

### Update `AGENTS.md` only when:

- global workflow rules change
- rule-loading behavior changes
- new common rules are added
- existing common rules are renamed, moved, or removed
- repository-wide agent behavior should change

Do not update `AGENTS.md` just because a feature implementation changed.

## File Header Format

For TypeScript, JavaScript, and React files, use:

````ts
/**
 * @ai-purpose Short description of this file's responsibility.
 * @ai-entry true | false
 * @ai-domain routing | auth | map | gis | ui | api | state | feature | page | etc
 * @ai-depends Important internal dependencies.
 * @ai-used-by Main callers or areas that use this file.
 * @ai-keywords Searchable keywords, component names, hook names, API names.
 * @ai-notes Important modification notes. Omit if unnecessary.
 */

## Guidelines

- Keep comments short and factual.
- Do not add AI headers to every file.
- Prefer headers on entry points, route files, page entries, complex components, feature modules, API clients, stores, providers, entities, and domain services.
- Skip tiny presentational components, simple constants, static assets, generated files, snapshots, lockfiles, and trivial re-export files.
- Do not modify runtime logic.
- Do not reformat unrelated code.
- Preserve license comments and shebangs above AI comments.
- If uncertain, use cautious language such as "likely", "appears to", or "추정".


## Post-Change Check

After completing a code task, briefly decide whether AI navigation metadata needs to be updated.

Use this decision:

```txt
[AI_NAVIGATION_MAINTENANCE_SUMMARY]

Updated:
- ...

AI headers:
- added: ...
- updated: ...
- unchanged: ...

AI_INDEX.md:
- updated sections:
- unchanged because:

AGENTS.md:
- updated: yes/no
- reason:

Future-agent navigation impact:
- ...

Skipped:
- ...

Uncertain areas:
- ...
````
