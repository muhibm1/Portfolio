# Project copy: DRAFT for the owner to confirm at G3

Status: **draft, not owner-written.** At G2 the owner asked for this copy to be drafted for him
("D2-D5 as recommended, draft the project copy for me", `approvals.md`, commit 24fbc85). Business
constraint 1 says no agent may write copy the owner has not approved, so this text ships only if
the owner approves or edits it at G3. The Build phase copies it verbatim into
`portfolioData.projects`; it must not paraphrase it.

Sources, each read on 2026-09-12 through the GitHub API as the owner (confirmed):
`muhibm1/workhorse` README, `muhibm1/Shu` README, `muhibm1/wasl` README and
`plan/v2-user-experience.md`. Nothing below goes beyond what those files state.

## Blocking fact found while drafting

**All three repositories are private** (confirmed: GitHub search API returns `private: true`,
`visibility: private` for `workhorse`, `Shu` and `wasl`). A visitor following a repository link
gets a 404. G2-D1 asked the owner to confirm they are public; they are not.

Recommended handling (the Build phase implements this unless the owner overrides at G3): each
entry carries a `repoPublic` boolean. When it is `false`, the card shows "Private repository ·
walkthrough on request" with a `mailto:` link instead of a GitHub link. If the owner makes a
repository public before the build, set its flag to `true` and the link appears.

The same search shows **`muhibm1/Portfolio` is private too**. See "Deploy blocker" below.

## workhorse

- **Tagline:** An agentic software delivery lifecycle for forward-deployed engineering, packaged
  as a Claude Code plugin.
- **Description:** Give it a problem and an outcome inside a client repository. Single-purpose
  agents discover, specify, plan, build, verify, review, ship and hand over, and a human approves
  at gates that scale with risk. Hooks, not prompts, enforce the rules: protected paths, locked
  tests during fix loops, and no push while a required gate is open. This site was built through
  it.
- **Stack:** Claude Code plugin · Node.js · Markdown agents and skills
- **Status:** Active
- **repoPublic:** false
- **Owner check:** the last sentence is true only once this change ships through G4 and G5. The
  README says 25 agents and the GitHub repository description says 24, so the copy states no
  count. Fix whichever is wrong in that repository.

## Shu

- **Tagline:** An autonomous intraday trading engine built to prove a strategy has an edge before
  it risks a dollar.
- **Description:** A Python engine and FastAPI + React dashboard for US equities. Backtest and live
  run the same object graph with three ports swapped, every order passes a thirteen-check
  pre-trade risk gate, and no strategy trades until it clears a walk-forward, CPCV and
  Deflated-Sharpe validation harness. Paper only today, and nothing trades yet, by design.
- **Stack:** Python · FastAPI · React · TypeScript · Postgres · Alpaca · Docker
- **Status:** In progress
- **repoPublic:** false

## wasl

- **Tagline:** A mentorship marketplace for Muslim professionals, with mosques and student
  associations supplying the trust.
- **Description:** A React and Supabase progressive web app that connects someone with a career
  question to a professional who has already done the thing. The v2 design turns a member
  directory into a mentorship loop: offers instead of titles, capacity limits that protect
  mentors, a scheduled coffee chat on every accepted request, and community verification.
- **Stack:** React · Vite · TypeScript · Supabase · PWA
- **Status:** In development
- **repoPublic:** false
- **Owner checks:**
  - The README says "scaffolding stage, no application code", while
    `plan/v2-user-experience.md` says auth, onboarding, the directory, communities and
    connections are built. The copy above claims neither. Say which is true and a sentence can
    be added.
  - This entry names the project's religious audience on a public professional page. That is
    the owner's own choice to make; it is flagged only so it is made deliberately.

## Deploy blocker for the Plan phase

`muhibm1/Portfolio` is private. GitHub Pages on a private repository requires a paid GitHub plan
on a personal account (see the evidence line the main session records in `conductor-log.md`).
If the owner is on GitHub Free, the first deploy fails at the Pages step. Options for G3:

1. Make `muhibm1/Portfolio` public before the first push. The repository then exposes
   `docs/sdlc/**`, which R89 already redacts of the phone number, and the git history, which
   still contains it (accepted risk in the spec's response to audit).
2. Keep it private and use a paid plan.
3. Keep the source private and publish `dist/` to a separate public repository. This changes
   ADR 0005 and needs a spec amendment, so it is not recommended for this change.
