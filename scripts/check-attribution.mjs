// No AI attribution in commits: no Co-Authored-By naming an AI tool, no Claude-Session
// trailer, no claude.ai/code link, no "Generated with" footer. Human co-authors pass.
// Usage: node scripts/check-attribution.mjs <base> <head>   (defaults: origin/main..HEAD)
import { execSync } from 'node:child_process'

const [base = 'origin/main', head = 'HEAD'] = process.argv.slice(2)
const range = `${base}..${head}`
const shas = execSync(`git rev-list ${range}`, { encoding: 'utf8' }).split('\n').filter(Boolean)
const BAD = [
  [/^Co-Authored-By:.*\b(claude|anthropic|gpt|openai|copilot|gemini|cursor)\b/im, 'an AI co-author trailer'],
  [/^Claude-Session:/im, 'a Claude-Session trailer'],
  [/claude\.ai\/code/i, 'a claude.ai/code link'],
  [/Generated with \[?Claude/i, 'a "Generated with" footer'],
  [/noreply@anthropic\.com/i, 'an anthropic.com address'],
]
let fail = 0
for (const sha of shas) {
  const msg = execSync(`git log -1 --format=%B%n%an%n%ae ${sha}`, { encoding: 'utf8' })
  for (const [re, why] of BAD) if (re.test(msg)) { console.error(`${sha.slice(0, 7)}: ${why}`); fail = 1 }
}
if (fail) process.exit(1)
console.log(`${shas.length} commit(s) in ${range}: no AI attribution`)
