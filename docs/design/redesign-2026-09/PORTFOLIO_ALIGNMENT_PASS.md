# Portfolio alignment pass: make the site agree with the resume, and link the public repos

Owner: Muhammad Muhibullah
Live site: https://muhibm1.github.io/Portfolio/ (GitHub Pages, repo `muhibm1/Portfolio`)
Companion document: `PORTFOLIO_REDESIGN_PLAN.md` in this folder, plus the mockups it references.

> Committed copy, redacted (change `2026-09-25-rebuild-portfolio-to-approved-redesign`, revision
> of 2026-09-28, decisions D31, D36 and D37, ADR 0007). Withheld from this copy, each replaced by
> a one-line note saying what was withheld: the measured timings of the owner's own tools' API,
> database, retrieval and model calls (D26, D36); the resume text of Appendix A and the owner's
> private working notes of Appendix B, because no resume may exist anywhere in this public
> repository (D24, R151); section 7, which said where private names had sat in the snapshot
> repositories (D37). The owner's answers of 2026-09-28 also override this document where they
> differ: no resume is served from the site (section 5 and section 8 item 3 are void), and the
> MCP section carries no timing figures. His G2 decision of the same day (D41 to D45) overrides it
> twice more: the WorkHorse run count is "5 of 5" and the other run stats stay on the site, and
> Paddock is shown as current (D44), so this document's Paddock rows are superseded and noted in
> place. Every resume string the build needs is written verbatim in the
> change's spec (R154, R155); the spec, not this copy, is the build's source. The original stays
> on the owner's machine at `C:\Users\alqai\Downloads\PORTFOLIO_ALIGNMENT_PASS.md`.

## How this document relates to the redesign plan

The redesign plan still stands. Its ground rules, design system, routes, page structure and verification steps are unchanged. This document is an **overlay**: where the two disagree, this one wins, because it reflects a resume that was rewritten after the plan was written, three repositories that are now public, and one project that shipped since.

Read both before starting. Do the redesign plan's work, applying every correction below as you go, rather than building the old copy first and patching it afterward.

There are three goals here:

1. Nothing on the site contradicts the resume. A recruiter reads the resume, opens the site, and finds the same claims in the same words.
2. Every project that has public code links to it, so an engineer can click straight from the claim to the source.
3. The site never claims more than the code and the record support.

---

## 1. Ground rule changes

These amend section 0 of the redesign plan.

- **Rule 6 is amended.** FastAPI is now a permitted claim: Studbook's service layer is FastAPI and the code is public. Everything else in that rule stands: no Databricks, no Delta Lake, no Go, no fine-tuning, no TensorFlow, no NiFi, no MLOps.
- **Kubernetes stays restricted on the site.** The owner's exposure is job submission on AWS EKS, not cluster operation. Say "AWS EKS" in context. Do not give Kubernetes its own line in the toolkit.
- **New rule: never imply that WorkHorse or Studbook has users, a team or adoption.** They are the owner's own tools and he is the only user. Write "the engineering record WorkHorse produces", never "a team's engineering record". Do not write "used by", "adopted", "customers", "our team" or anything that implies more than one operator. The strength of this work is the rigor, not the headcount, and an implied user base is the one claim here that cannot survive a single question.
- **New rule: the repositories are public snapshots, not the live development repos.** Label them that way where it matters. Do not imply ongoing public development or invite contributions.

---

## 2. Facts that changed since the redesign plan

Replace these rows in the plan's section 6 approved facts table. Everything not listed here is unchanged.

| Fact | Old value in the plan | Correct value |
|---|---|---|
| Freelance role title | Project Manager | **Software Consultant**, Freelance, Dec 2022 to May 2024 |
| Freelance description | feature delivery for an education product; QA and reporting workflows | Turned a client's goals for an education platform redesign into scoped work, modernized its frontend and built the backend connectivity it needed, owned delivery through to a beta-ready platform they could launch and demo. QA and reporting workflows kept delivery visible to the client |
| edX role title | Machine Learning Instructor | **AI Instructor**, Oct 2023 to Mar 2025 |
| edX description | taught ML | Taught machine learning, neural networks, deep learning and NLP to two cohorts of about 30, most new to code. The office hours and 1:1 mentorship detail may stay on the site |
| EMR to EKS | Migrated validation infrastructure from AWS EMR to EKS | **Worked with DataOps and data evaluation to migrate** data validation from AWS EMR to AWS EKS and move checks upstream. The collaboration is part of the claim and must not be dropped |
| WorkHorse ship rejections | 0 rejected ship documents since the redesign | **Wrong and must be removed.** The MCP server change was rejected once at the ship gate on a latency requirement, then reworked and merged. That rejection is now a headline story on the resume, so a "zero rejections" stat on the site directly contradicts it |
| WorkHorse merged changes | 4 of 4 real changes merged | The MCP server change merged after that count was written. **Ask the owner for the current number** and use what he gives you. Do not infer it. (Answered by the owner at G2 on 2026-09-28: 5 of 5, with the other run stats kept, D41 to D43) |
| Studbook MCP latency framing | Per-call latency figures | Withheld from this copy: the before-and-after per-call timings and the measured overhead of the MCP path over a direct library call, which the owner keeps off the public site (2026-09-28 answer, D26) |

Two numbers in the plan's table are still approved but should **not** appear on the site in that form, because the owner found them unreadable and cut them from the resume:

- "recall@5 0.85 (0.56 vector only)" and the derived "+52%". If a slot needs a retrieval stat, use "3 of 3 traps refused" or "every claim tied to a source" instead. The retrieval table on the WorkHorse case study may keep its numbers, since a reader who scrolls that far is looking for them.
- "75% fully correct" stays off the site, as the plan already says.

---

## 3. Claims on the live site that contradict the new resume

These are in addition to the plan's section 1 removal table, and each one is a direct conflict rather than merely unverified.

| On the site now | Why it conflicts | Action |
|---|---|---|
| The "Live FDE Decision Triage Simulator" and its 48 ms scripted latency | The resume's strongest technical claim is measured latency discipline (a written budget and measured figures, withheld from this copy). A fabricated millisecond figure a few clicks away destroys that claim rather than supporting it | Remove, as the plan already requires. This is the highest priority item on the site |
| "100% Automated" on the Apple LLM case study | The resume describes a system that decides approve, reject or hold **with a reviewable audit trail**, which is human-reviewable by design | Remove. The approved framing is "decides approve, reject or hold, auditable and reviewable by a person" |
| The 40% presented as "Production Outage Drop, via CI/CD gates, schema rewrites & WebSocket sync" | Merges two different jobs. The resume has release-blocking failures down about 40% at Apple, and incidents down about 40% at Neural Newsletters from CI/CD quality gates and tests | Split them. Each 40% belongs to its own employer with its own cause |
| "99.9% Release Continuity", "zero unauthorized actions", "Confidence >= 95% auto-approve", "Zero Data Corruption", "sub-10ms data fetches", "11x Increase" | None appear on the resume and none are supportable | Remove, as the plan already requires |
| "Private repository, walkthrough on request" on the case studies | All three repositories are public | Replace with real links. See section 4 |
| Paddock presented as a current component | Absent from the resume | Superseded by the owner at G2 on 2026-09-28 (D44): Paddock stays on the site as a current part of WorkHorse, with its tests, stack and parity-gate paragraph as the mockup has them; this row's original action is void |
| No mention of the Studbook MCP server anywhere | It is now the most technically substantial bullet on the resume | Build the MCP section on the WorkHorse case study. See section 6 |

---

## 4. Public repository links

The three repositories:

| Repository | URL | What it holds |
|---|---|---|
| WorkHorse | https://github.com/muhibm1/workhorse-snapshot | The agent pipeline, hooks, skills and plugin tests |
| Studbook | https://github.com/muhibm1/studbook-snapshot | Retrieval, evals, the parity gate and the MCP server |
| Paddock | https://github.com/muhibm1/paddock-snapshot | The desktop app and its parity gate (D44: shown as a current part of WorkHorse) |

Place a link everywhere the corresponding work is discussed, so a reader never has to hunt for the code:

1. **Site header.** Add a GitHub link to the main navigation on every page, next to the Resume button, pointing at https://github.com/muhibm1. The plan currently puts GitHub only in the footer. It belongs in both, because the people most likely to click it leave the page before they reach the bottom.
2. **Homepage, WorkHorse featured card.** A secondary "View the code" link beside the existing "Read the case study" link, pointing at the WorkHorse repository.
3. **Homepage, hero or Right now card.** One line that the code is public, linking to the GitHub profile. Keep it to a single short line and do not rewrite the mockup's surrounding copy.
4. **WorkHorse case study hero.** A repository link in the meta row beside the eyebrow, labeled "Code: workhorse-snapshot".
5. **WorkHorse case study, Studbook and retrieval section.** Link the Studbook repository at the first mention of Studbook.
6. **WorkHorse case study, MCP server section.** Link the Studbook repository again, since the MCP server lives there. Say so explicitly, so nobody goes looking for a separate repository.
7. **WorkHorse case study, Paddock paragraph.** Link the Paddock repository once, framed like the other two as a public snapshot (D44 superseded this item's original framing).
8. **`/work` listing page.** Each card that has public code gets a small repository link under the title.

Link mechanics: real `<a>` elements, `target="_blank"` with `rel="noopener noreferrer"`, an accessible label that names the destination, and the same accent hover as other links. Never render a bare URL in body copy.

---

## 5. Resume PDF

Void in the committed copy: the owner decided on 2026-09-28 that no resume is served from the site (D24). The section's original text, which described replacing the served PDF with a new one and checking two title strings in it, is withheld as no longer applicable.

---

## 6. Case study specific work

**WorkHorse** (`CS-WorkHorse.dc.html`). This page carries the most change.

Add an MCP server section, placed after the Studbook retrieval material. It should tell the story in this order, because the order is what makes it persuasive:

1. What it is: a server that lets other agents query the engineering record mid run, so an agent can look up a past decision instead of re-deriving it.
2. What was proved: identical to the direct path over 40 evaluation questions, same passages, same order, scores within 0.0001, identical model requests, enforced in CI.
3. What went wrong: the first version missed a latency requirement written before the work started, and the ship gate rejected it.
4. What fixed it: per-session connection reuse and removing a duplicated model pass. (The before-and-after call timings and the overhead over a direct library call are withheld from this copy, D26.)
5. What protects the answers: a default scope limited to decided documents, so an agent cannot cite its own in-flight proposal as settled fact.
6. How it was built: end to end by WorkHorse itself, with 12 of 12 review findings fixed before approval.

Do not soften point 3. The rejection is the point of the section. It is evidence the gates have teeth, and it is the story the owner leads with in interviews.

Also add a short data access line to this page, matching the resume: every query runs as a read-only Postgres role under row-level security, connections are pinned to one certificate authority, credentials are never written to a log, and retrieved text reaches the model as data rather than instructions so a document cannot hijack the agent reading it.

Remove any "0 rejected ship documents" stat wherever it appears on this page or the homepage featured card, per section 2.

**LLM decision system** (`CS-Decision.dc.html`). Remove "100% Automated" and anything implying no human in the loop. Keep "live since November 2025". The opening should match the resume's causal order: a review bottleneck was identified, the fix was scoped with the teams who own the requests, then the system was deployed. The scoping step matters for a forward deployed role and the current page skips it.

**Integration tool** (`CS-Integration.dc.html`). No factual change. Confirm the 50% is described as turnaround, not throughput.

**Data Health** (`CS-DataHealth.dc.html`). The migration is now "worked with DataOps and data evaluation to migrate", not a solo action. Keep the remediation work in the first person, since that part is the owner's own.

**Neural Newsletters** (`CS-NeuralNewsletters.dc.html`). Remove "sub-10ms data fetches". The 40% is incidents, from CI/CD quality gates and tests. The 15 to 20% is generation latency from query rewrites. Keep those two separate.

---

## 7. Owner action before the links go live

Withheld from the committed copy (D37): this section listed two cosmetic items to clean in the public snapshot repositories before the links go live, naming the files in which two private names had appeared. The main session reported both items done on 2026-09-28 (the change's spec, R153). Each snapshot repository has one commit, one branch and no tag on GitHub, so no earlier file version is in its history (confirmed by `gh api` on 2026-09-28, D37).

---

## 8. Verification, in addition to the plan's section 8

1. Every repository link resolves with a 200 in a signed-out browser, including the deep links on the case studies.
2. The header GitHub link appears on every route, including case study pages, at both desktop and mobile widths.
3. Void in the committed copy (no resume is served, D24).
4. Search the rendered site for each string in section 3's first column. Zero matches.
5. Search the rendered site for "team", "our", "users", "customers" near any WorkHorse or Studbook copy. Every hit must be about the owner's employers, never about his own tools.
6. Produce a side by side list for the owner: every claim on the site that also appears on the resume, with the site wording and the resume wording next to each other. Flag any pair that differs in substance, not just phrasing. This is the check that matters most, so do not skip it or summarize it.

**Stop and ask the owner** before deploying, before changing the resume PDF, and before publishing repository links if section 7 is not confirmed done.

---

## Appendix A: the resume

Withheld from the committed copy (D24, R151): the original carries the resume's full text as the canonical wording the site must agree with. No resume text is committed to this repository. Every resume string the site uses is written verbatim in the change's spec (R154, R155), and the side-by-side check at Ship (R158) is made against the owner's original.

## Appendix B: three surface consistency checklist

Withheld from the committed copy (D24, R151): the original carries the owner's private working notes for keeping the resume, LinkedIn and the site consistent. They are for the owner, not for the build.
