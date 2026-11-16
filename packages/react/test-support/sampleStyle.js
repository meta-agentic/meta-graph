// A style specification for the tests: four node kinds, three edge confidences. The size
// rule is the one the golden layout test's oracle was written against (3 + √degree, at
// most 14), so positions can be compared exactly.
export const KIND_COLOR = { alpha: '#4477aa', beta: '#66ccee', gamma: '#228833', delta: '#ccbb44' }

export const sampleStyle = {
  node: {
    color: { by: 'type', map: KIND_COLOR, default: '#8b949e' },
    size: { by: 'degree', base: 3, scale: 'sqrt', max: 14 },
    label: { by: 'label' },
  },
  edge: {
    stroke: '#30363d',
    opacity: { by: 'confidenceLabel', map: { HIGH: 0.7, MID: 0.35, LOW: 0.15 }, default: 0.3 },
  },
  legend: { by: 'type', alias: { delta: 'spike' } },
}
