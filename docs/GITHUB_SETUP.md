# GitHub Repository Setup

Correct setup order:

```text
Create repository
→ Push initial project
→ Run GitHub Actions once
→ Confirm backend and frontend checks exist
→ Invite teammates
→ Note: branch protection requires GitHub Pro on private repos (manual PR + CI workflow instead)
```

## Team lead: create and upload

1. On GitHub, choose **New repository**.
2. Name it `gridmitra` and choose **Private** during hackathon development.
3. Do not initialize it with a README, `.gitignore`, or license.
4. Confirm that `README.md`, `.gitignore`, `.env.example`, and `compose.yaml` already exist in the starter folder before the first commit — they do.
5. In the extracted starter folder, run:

```bash
git init
git add .
git commit -m "chore: initialize GridMitra monorepo"
git branch -M main
git remote add origin https://github.com/<OWNER>/gridmitra.git
git push -u origin main
```

If Git asks for identity first, prefer repository-level configuration unless the teammate intentionally wants the identity for every repository:

```bash
git config user.name "Your Name"
git config user.email "your-github-email@example.com"
```

## Run GitHub Actions once

After the first push, GitHub Actions runs automatically. Open the **Actions** tab and confirm the workflow completes. Note the exact job names for the backend and frontend checks.

## Enable branch protection (Pro-gated on private repos)

GitHub currently requires **GitHub Pro** to enable branch protection (classic or rulesets) on a **private** repository. On the free plan, both the rulesets API and the classic protection API return `403` ("Upgrade to GitHub Pro or make this repository public").

For the hackathon, do not pay for Pro and do not make the repository public just for this. Instead:

- Run the workflow manually: feature branch → push → open pull request → wait for CI (backend + frontend jobs) → one reviewer approves → squash-merge.
- Never merge a pull request while any required CI check is failing.
- Never force-push `main`.
- Optionally revisit protection after the event if the repository is public or the account is upgraded.

If the account is upgraded to Pro, or the repository is later made public, enable the ruleset exactly as in the reference below.

Reference ruleset (GitHub Pro or public repos): **Settings → Rules → Rulesets → New branch ruleset**:

- Target branch: `main`
- Require pull request before merging
- Require status checks: `backend` and `frontend` (these exact check names must exist in GitHub Actions before they can be selected in the ruleset)
- Block force pushes
- Restrict deletions

Repository settings:

- Enable squash merging.
- Disable merge commits to keep history simple.
- Automatically delete head branches after merge.
- Keep Issues enabled for the included task template.

## Add the other two members

Go to **Settings → Collaborators and teams → Add people**. Invite both teammates using their exact GitHub usernames and give them **Write** access. Each teammate must accept the invitation before cloning/pushing.

## Every teammate: clone and verify

```bash
git clone https://github.com/<OWNER>/gridmitra.git
cd gridmitra
cp .env.example .env
docker compose up --build
```

Then open http://localhost:5173 and run the checks in `docs/SETUP.md`.

## First three issues

Create and assign these immediately, keeping backend and optimizer work separate:

1. `Frontend: scenario controls and dashboard states`
2. `Backend: API validation, endpoints, and reactive baseline comparison`
3. `Optimizer: constraints, energy balance, and model tests`
4. `Integration: stress scenario, QA, and demo evidence`

Each member creates their own feature branch and pushes from their own laptop. Nobody needs a second laptop to approve or make a commit.