// Ask npm, for each package, whether it trusts this workflow run: the same identity
// exchange `npm publish` and `npm stage publish` perform, without publishing anything.
// Prints npm's answer per package and never the token npm returns. Runs only inside the
// release workflow, which holds the GitHub identity npm's trusted publisher is bound to.
const PACKAGES = ['@meta-agentic/graph-model', '@meta-agentic/graph-react', '@meta-agentic/graph-query', '@meta-agentic/meta-graph']
const REGISTRY = 'https://registry.npmjs.org'

const { ACTIONS_ID_TOKEN_REQUEST_URL: idUrl, ACTIONS_ID_TOKEN_REQUEST_TOKEN: idAuth } = process.env
if (!idUrl || !idAuth) {
  console.error('No GitHub identity token available: the job needs `permissions: id-token: write`.')
  process.exit(1)
}

const url = new URL(idUrl)
url.searchParams.append('audience', `npm:${new URL(REGISTRY).hostname}`)
const idRes = await fetch(url, { headers: { Accept: 'application/json', Authorization: `Bearer ${idAuth}` } })
const { value: idToken } = await idRes.json()
if (!idToken) { console.error(`GitHub returned no identity token (HTTP ${idRes.status}).`); process.exit(1) }

// The claims npm matches against each package's trusted publisher (no secret in them).
const claims = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString())
console.log('This run, as npm sees it:')
for (const k of ['repository', 'workflow_ref', 'environment', 'ref', 'repository_visibility']) console.log(`  ${k}: ${claims[k] ?? '(none)'}`)
console.log()

let refused = 0
for (const name of PACKAGES) {
  const res = await fetch(`${REGISTRY}/-/npm/v1/oidc/token/exchange/package/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}`, Accept: 'application/json' },
  })
  let body = {}
  try { body = await res.json() } catch { /* not JSON */ }
  if (res.ok && body.token) {
    console.log(`  trusted   ${name}`)
  } else {
    refused++
    console.log(`  REFUSED   ${name}: HTTP ${res.status} ${body.message ?? body.error ?? ''}`.trimEnd())
  }
}
console.log()
if (refused) {
  console.log(`npm refused ${refused} of ${PACKAGES.length}. Compare the claims above with each package's npm settings → Trusted Publisher: organisation and repository, workflow file name, environment name.`)
  process.exit(1)
}
console.log('npm trusts this workflow for every package.')
