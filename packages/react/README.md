# @meta-agentic/graph-react

Draws any `@meta-agentic/graph-model` graph. The component knows a graph and a style, nothing about where the graph came from: a test fails if a source's names, attributes or colours appear in this package.

```jsx
import { GraphCanvas, GraphList, resolveStyle, forceLayout } from '@meta-agentic/graph-react'

const style = resolveStyle({
  node: { color: { by: 'type', map: { story: '#4477aa', epic: '#cc6677' }, default: '#8b949e' },
          size: { by: 'degree', base: 3, scale: 'sqrt', max: 14 }, label: { by: 'label' } },
  edge: { stroke: '#30363d', opacity: { by: 'kind', map: { dependency: 0.7 }, default: 0.3 } },
  legend: { by: 'type' },
})
const geometry = forceLayout(model, { size: style.nodeSize })   // deterministic: same model, same positions

<GraphCanvas model={model} geometry={geometry} style={style}
             labelFor={(n) => n.metadata.degree > 5} onNodeClick={(n) => open(n.id)}
             behaviours={{ fisheye: true }} />
<GraphList model={model} style={style} onNodeClick={(n) => open(n.id)} />
```

- **Style specification**: a declarative mapping from attributes to colour, size, label, stroke and opacity; the legend derives from it (`style.legend()`), and a status is never colour alone.
- **Layout strategies**: `layout(model, options) → geometry` (positions, routes, bounds, home view); coordinates, not pixels. `forceLayout` (d3-force, fixed seed) now; the layered strategy for directed graphs is next.
- **GraphCanvas**: pan, wheel zoom around the cursor, reset (`ref.resetView()`), hover titles, click and keyboard focus on nodes; fisheye, sparks and an ambient pulse as opt-in behaviours.
- **GraphList**: the same nodes and edges as text, one focusable button per node.

Peer dependencies: `react`, `react-dom` (18 or later). Design records: `docs/adr/` at the repository root.
