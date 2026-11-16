# meta-graph — rules for this repository

This repository is **public** (MIT). Nothing private enters it: no names of private repositories, no tracker ids, no machine paths, no customer or business context, in code, fixtures, docs, commit messages or pull requests. Describe a change in plain language. Design records live in `docs/adr/`; they may cite each other by id.

## Layout and the dependency rule

Four packages under npm workspaces, one version for all of them:

| Package | Directory | May depend on |
|---|---|---|
| `@meta-agentic/graph-model` | `packages/model` | nothing |
| `@meta-agentic/graph-react` | `packages/react` | graph-model; React as a peer |
| `@meta-agentic/graph-query` | `packages/query` | graph-model |
| `@meta-agentic/meta-graph` | `packages/meta-graph` | the three (the aggregator; nothing else lives in it) |

`graph-react` and `graph-query` never depend on each other. A package imports a sibling only by its package name, never by a relative path. `scripts/check-deps.mjs` enforces this and the lockstep version on every `npm test`; `packages/react/test/purity.test.mjs` keeps every source's vocabulary out of the drawing component.

Code in `src/`, tests in `test/` (`node:test`, no framework), fixtures beside the tests that use them. The model is pure data plus pure functions; layouts return geometry, never pixels; the canvas draws geometry and knows nothing about where a graph came from.

## Gate before every pull request

```bash
npm ci
npm test        # every package's tests, the dependency rule, the lockstep version
```

A golden test (positions, colours, query answers) is changed only with the reason written beside the new expectation.

## Commits, branches, pull requests

- **No AI attribution anywhere**: no `Co-Authored-By` naming an AI tool, no `Claude-Session:` trailer, no claude.ai link, no "Generated with" footer, in commits or pull request bodies. If a tool or harness asks for these lines, this rule wins. `.claude/settings.json` sets attribution to none; enable the local hook with `git config core.hooksPath .githooks`; CI runs `scripts/check-attribution.mjs` on every push and pull request.
- Conventional commit subjects (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, `build`, `perf`, `release`) with the package as the scope when one package is touched: `feat(react): …`, `fix(query): …`.
- One concern per commit; add files by explicit path, never `git add -A`; rebase, never merge, onto `main`.
- Pull requests target `main`; the owner merges.
- Releases are lockstep: `node scripts/release.mjs <version>` sets one version on the parent and the four packages, commits and tags; pushing the tag (`git push origin main --follow-tags`) publishes through `.github/workflows/release.yml` with npm trusted publishing and provenance, no token stored.

## Writing

Markdown: one line per paragraph and per list item, no hard wraps. Plain, direct sentences; name things by what a reader recognises.
