// The canonical model is one definition for both sides (ADR-MOS-18, part 3). It lives in
// @meta-agentic/graph-model; this package re-exports it instead of keeping a copy.
export { PROFILE, nodesOf, edgesOf, degrees, validateModel } from '@meta-agentic/graph-model'
