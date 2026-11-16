# meta-graph

Graph toolkit for JavaScript, in one repository with four packages that share one version and one release train:

| Package | What | Depends on |
|---|---|---|
| [`@meta-agentic/graph-model`](packages/model) | The canonical graph model: a [JSON Graph Format](https://jsongraphformat.info) v2 profile (`meta-graph/1`), helpers, validation, and readers for other formats (NetworkX node-link today) | nothing |
| [`@meta-agentic/graph-react`](packages/react) | Draw any model in React: declarative styles with derived legends, layout strategies (force now, layered next), `GraphCanvas` with pan, zoom and opt-in behaviours, `GraphList` as its text twin | model, d3-force; React as a peer |
| [`@meta-agentic/graph-query`](packages/query) | A read-only query language: a typed algebra closed over the model, proved on a 35-query corpus; the textual surface and interpreter are in progress | model |
| [`@meta-agentic/meta-graph`](packages/meta-graph) | The aggregator: the three at one version, one install | the three |

The dependency rule (everything points at the model; react and query never at each other) and the lockstep version are checked by `npm test`.

## Develop

```bash
npm ci
npm test                 # every package's tests, the dependency rule
node scripts/release.mjs 0.2.0   # lockstep bump, commit and tag; publishing is a separate step
```

Node 22 or later. Tests use `node:test`; the React components are mounted in jsdom through esbuild. No AI attribution trailers in commits (`scripts/check-attribution.mjs`, run in CI).

## Principles

- **The model knows no source, the drawing knows no model origin.** A reader turns a format into the model; a style turns attributes into colour, size and labels; a layout turns a model into geometry; the canvas draws geometry. Each layer is replaceable.
- **Determinism.** The same model and options give the same positions, so drawings are tested with golden files.
- **Never colour alone.** A status is shown by colour and by a text label; every drawing has a text twin.
- **Queries are read-only** and bounded: no I/O, no side effects, a step budget.

## Records

Design decisions live in [`docs/adr/`](docs/adr): ADR-MOS-18 (one drawing component, interchangeable sources) and ADR-MOS-19 (this repository and its packages). They were written in the dashboard this code was extracted from, and moved here with the code's history.

## Licence

MIT.
