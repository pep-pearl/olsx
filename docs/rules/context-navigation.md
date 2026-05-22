# Context Navigation Rule

## Purpose

Use this rule to minimize unnecessary context usage during normal development tasks.

This rule is for finding the right files to read.
It is not for adding or modifying AI navigation metadata.

## Before Exploring Source Files

1. If the user named exact files, start with those files.
2. Otherwise, read `/AI_INDEX.md` first.
3. Use `/AI_INDEX.md` to identify the relevant domain, flow, entry points, and minimum file set.
4. Check file-level `@ai-*` comments before reading full files.
5. Read full files only when directly relevant.
6. Prefer targeted search over broad repository scans.
7. Do not scan the entire repository unless the task explicitly requires it or the index is missing/stale.

## Search Order

1. User-provided file paths
2. `/AI_INDEX.md`
3. File-level `@ai-purpose`, `@ai-domain`, `@ai-keywords`
4. Relevant source files
5. Relevant tests
6. Broader search only if needed

## If `/AI_INDEX.md` Is Missing Or Stale

Mention that the index is missing or stale, then continue with the smallest targeted search possible.
"Do not create or update AI navigation metadata unless the task asks for it."
