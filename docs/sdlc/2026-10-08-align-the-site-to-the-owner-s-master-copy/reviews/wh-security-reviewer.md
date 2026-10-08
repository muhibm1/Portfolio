Verdict: 1 findings (0 critical, 0 high, 1 medium, 0 low)

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| medium | public/og.png (served via src/pageMeta.js:10 `OG_IMAGE`) | The share image still reads "Tickets decided a day". The diff changed only its source, docs/design/og.svg:20 and :82, and did not re-render the PNG (`git diff --stat main...HEAD -- public/` is empty; the last commit to touch it is 053d719). The scanner skips binaries (scripts/forbidden-copy.mjs `scanFiles` skips BINARY_EXTENSIONS), so the new `'tickets decided'` ban cannot see it. Rule: the owner's master-copy decision-authority rule, which this change bans sitewide. Confirmed by opening public/og.png. | Every LinkedIn, Slack or iMessage preview of any route shows the claim that the agent decides tickets at Apple. The change removes that claim from every page, and the preview is the surface recruiters and the employer see first. Tests, build and the scanner all pass. | Re-render public/og.png from docs/design/og.svg at 1200x630 and commit it. Then add a check that fails when og.svg is newer than og.png in git history, or add a test that compares the og.svg text nodes against a recorded hash of the rendered PNG's source. |

Sweep and walk evidence (confirmed unless labelled):
- Injection/XSS: the new `section.subtitle` (src/components/CaseStudyPage.jsx:132) and the optional `step.note` / `data-gate` (src/components/CaseStudyFlowDiagram.jsx:23-28) render as React text and attribute values. No `dangerouslySetInnerHTML` is added. Values come only from src/data/portfolioData.js. Confirmed via the diff.
- Secrets: added lines grepped for key, secret, token, password, private-key and URL patterns. The only hit is the CSS comment "Redesign tokens". The diff touches no `.env*`, `*.pem`, `*.key`, workflow, package, `.npmrc` or agent-config path. Confirmed.
- Dependencies: `npm audit --omit=dev --audit-level=high` exit 0, 0 vulnerabilities (verify-logs/security_audit.log, commit b694061). No dependency change in the diff. Confirmed.
- Scanner: the new terms are case-insensitive and carry no `g`/`y` flag, so `RegExp.test` keeps no `lastIndex` state between lines. Letters-only strings (`TCS`, `Tata`, `via`, `messy`, `Ollama`) are word-bounded by `buildPattern`. The lookbehind in ZERO_REJECTED_TERM is supported on Node 22. Confirmed by reading scripts/forbidden-copy.mjs:116-136 and 243-260.
- Confidentiality: the new copy names no internal Apple system, tool, host or person. "unlock request", "geospatial snapshot" and "internal specification" are generic, and the disclaimer at portfolioData.js:397 is kept. Confirmed by reading the diff.
- Baseline checklist: no database, policy, function, bucket, admin surface, secret, env var or runtime import is in scope, so every item is n/a. Confirmed (static site, no such paths in the diff).
- Regimes: the profile selects none (.workhorse/profile.yml:129-133). The diff collects no visitor data and adds no third-party call. Confirmed.
- AgentShield: n/a. The diff touches no `.claude/`, `CLAUDE.md`, `agents/`, `skills/`, `hooks/`, `.mcp.json` or plugin manifest.

Findings outside scope:
- The repository muhibm1/Portfolio is PUBLIC (`gh repo view`, confirmed). Tracked files outside the scanner's scope (src, index.html, docs/design/og.svg) still publish the wording this change bans sitewide: "Apple (via TCS)", "LLM decision systems" and "self-hosted LLM". They are in docs/design-brief.md:5,88, docs/design/redesign-2026-09/*.dc.html and docs/design/redesign-2026-09/PORTFOLIO_REDESIGN_PLAN.md:20,123. Git history keeps the old copy whatever is edited now. The owner decides whether this matters.
- CLAUDE.md:29, docs/hosted-config.md:205 and scripts/phone-redaction-scan.mjs:32 still say "self-hosted". These are developer notes, not served copy, and outside scanner scope.

Not verified:
- Whether the expanded description of the Apple review process (portfolioData.js:218, 336-346) is cleared for publication by the employer. Only the owner can confirm. The text is the owner's master copy.
- Whether the employer line "Apple Maps" (no "via TCS") matches the owner's contract terms. This is a factual claim the owner controls (CLAUDE.md "Protected"), not a security control.
