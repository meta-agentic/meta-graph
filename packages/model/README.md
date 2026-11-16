# @meta-agentic/graph-model

The canonical graph model every other `meta-graph` package works on: the [JSON Graph Format](https://jsongraphformat.info) version 2, profiled as `meta-graph/1`, plus the readers that turn other formats into it. No dependencies.

```js
import { detectReader, nodesOf, edgesOf, degrees, validateModel } from '@meta-agentic/graph-model'

const text = await fs.readFile('graph.json', 'utf8')          // NetworkX node-link JSON, for instance
const model = validateModel(detectReader(text).parse(text, { id: 'kg', version: 1 }))
nodesOf(model)   // [{ id, label, metadata }, …] in model order
edgesOf(model)   // [{ source, target, relation, metadata }, …]
degrees(model)   // Map id → degree, counting both ends of every edge
```

## The profile

```json
{ "graph": { "id": "example", "directed": true,
             "metadata": { "profile": "meta-graph/1", "version": "2026-11-08T00:00:00Z" },
             "nodes": { "A-1": { "label": "First", "metadata": { "type": "story", "group": "epic-7", "status": "DONE", "weight": 3 } } },
             "edges": [ { "source": "A-2", "target": "A-1", "relation": "depends", "metadata": { "kind": "dependency", "confidence": 1 } } ] } }
```

Profile keys the packages understand: node `type`, `group`, `status`, `weight`, `source`, `degree` (computed, never read from a file); edge `kind`, `confidence` (0 to 1), `weight` (1 when absent). Unknown keys pass through untouched. Node order is the insertion order of `graph.nodes`.

## Readers

A reader is `{ name, detect(text, hint), parse(text, { id, version }) → model }`, pure, no I/O. Shipped: `networkx-node-link` (what NetworkX's `node_link_data` and graphify write). Register another with `registerReader`. DOT, GraphML, GEXF, GML and Cytoscape JSON are planned.

## Why

Design records: `docs/adr/ADR-MOS-18` (one drawing component, interchangeable sources) and `ADR-MOS-19` (this repository) at the repository root.
