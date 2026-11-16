# Repository rulesets

The rulesets this repository runs with, kept as files so a change to them is reviewed like code. GitHub does not read these files: import each one under **Settings → Rules → Rulesets → New ruleset → Import a ruleset**, and re-import after editing.

| File | Protects | Rules |
|---|---|---|
| `main.json` | the default branch | no deletion, no force-push, linear history; changes through pull requests only, squash or rebase (no merge commits), review threads resolved; the CI check `test` green and up to date with `main`. Administrators may bypass only inside a pull request (for example to merge past a broken check), never by pushing directly |
| `release-tags.json` | tags `v*` | only administrators create release tags; a release tag is never moved or deleted, so a published version always points at the commit npm's provenance names |

`required_approving_review_count` is 0 while the repository has one maintainer, who cannot approve their own pull request; raise it to 1 when a second maintainer joins. `actor_id` 5 is GitHub's built-in repository administrator role; `integration_id` 15368 is GitHub Actions, so only a check reported by Actions satisfies `test`.

## Settings that are not rulesets

Set once, by hand, in the repository settings:

| Where | Setting |
|---|---|
| General → Pull Requests | allow squash merging and rebase merging only; automatically delete head branches |
| Actions → General | allow GitHub-owned actions only (the workflows use `actions/checkout` and `actions/setup-node`); workflow permissions: read repository contents only; require approval for workflows from outside collaborators |
| Environments → `npm` | deployment tags `v*` only (the release workflow publishes from it) |
| Advanced Security | dependency graph, Dependabot alerts and security updates, secret scanning with push protection, code scanning default setup (CodeQL), private vulnerability reporting |
