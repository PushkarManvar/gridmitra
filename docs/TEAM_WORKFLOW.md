# Fast Team Workflow

The earlier laptop-to-laptop commit restriction is unnecessary. Every member commits and pushes their own work from their own laptop.

## Suggested ownership

Code ownership and issue ownership are separate. Each member owns their primary code area, and any teammate may assist or pick up issues elsewhere.

| Owner | Primary code area | Initial branch |
| --- | --- | --- |
| Member 1 | Frontend, charts, responsive UI | `feat/frontend-dashboard` |
| Member 2 | FastAPI, optimizer, tests | `feat/optimizer-api` |
| Member 3 | Demo data, integration, QA, pitch metrics | `feat/demo-integration` |

Ownership helps speed; it does not prevent teammates from helping elsewhere.

## One-time repository settings

On GitHub, protect `main` with:

- Require a pull request before merging
- Require the `frontend` and `backend` status checks
- Block force pushes and branch deletion
- Allow squash merge

For a 30-hour hackathon, one quick approval is ideal. Never merge while any required CI check is failing. If only one member is available, the author can share a screen, run CI, and merge after a documented self-review; never bypass a failing check.

## Feature development loop

```bash
git switch main
git pull --ff-only
git switch -c feat/short-description

# work and test
git add <specific-files>
git commit -m "feat: describe the user-visible change"
git push -u origin feat/short-description
```

Open a small pull request, let CI finish, review the changed files, then squash-merge. Delete the remote feature branch. Start the next task from the updated `main`.

## Conflict prevention

- Only the frontend owner edits global layout files during the first integration block.
- Only the backend owner edits optimizer equations during the first integration block.
- Agree on the API contract before wiring charts.
- Shared sample inputs live in root `data/`; do not paste separate copies into frontend and backend.
- Frontend types and backend schemas must follow `DATA_CONTRACT.md` rather than maintaining independent field definitions.
- Keep pull requests small enough to review in five minutes.

## Commit types

- `feat:` user-facing feature
- `fix:` bug fix
- `test:` tests only
- `docs:` documentation only
- `chore:` configuration or maintenance

## Before merge

- No secrets or `.env` files are staged.
- Prepared demo scenario still works.
- Relevant tests pass.
- Optimization equations must not change without updating `OPTIMIZATION_MODEL.md`.
- API field changes must update `DATA_CONTRACT.md` and `API_CONTRACT.md` in the same pull request.
- API contract and screenshots are updated when behavior changes.
- Simulated metrics are labelled as estimates.
