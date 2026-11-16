# @meta-agentic/graph-query

A read-only query language over `@meta-agentic/graph-model` graphs. What exists today is its **algebra**: pure, typed operators closed over the canonical model, proved on a 35-query corpus over four fixture graphs (directed and undirected, connected and disconnected, labelled and structure-only, weighted and unweighted). The textual surface and the interpreter are the next step; the chosen direction and the comparison of three candidate surfaces are in [`docs/spike.md`](docs/spike.md).

```js
import { graph, nodes, reachSet, any, components, shortestPath, quotient } from '@meta-agentic/graph-query'

const g = graph(model)
// TO DO items whose transitive dependencies include something NO GO
nodes(g, (n) => n.metadata.status === 'TO DO'
  && any(reachSet(g, [n.id], { dir: 'out', kind: 'dependency' }), (id) => g.nodes.get(id).metadata.status === 'NO GO'))
components(g)                               // weakly connected components, largest first
shortestPath(g, 'A', 'B')                   // by weight, or hops when the graph is unweighted
quotient(g, 'group')                        // one node per group, edges weighted by crossing count: a model again
```

Operator families: selectors · neighbourhood and reach · set algebra · quantifiers · aggregates with per-element grouping · structure (components, SCC, articulation points, bridges, cycles) · paths (shortest, simple with bounds, critical) · centrality, cores, trees, motifs and whole-graph facts · constructors (induced, edge-induced, closure graph, quotient) · sets of graphs (diff, join).

Three rules hold throughout: direction belongs to the graph, not the query; weight defaults to 1; a missing property makes a predicate false, never an error.

The corpus (`test/corpus.test.mjs`) is the acceptance suite: every expected answer was derived by hand on the fixtures before the evaluator ran, and the five disagreements and their adjudications are recorded beside the expectations.
