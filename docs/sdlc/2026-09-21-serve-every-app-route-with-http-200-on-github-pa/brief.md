# Serve every app route with HTTP 200 on GitHub Pages

Change id: `2026-09-21-serve-every-app-route-with-http-200-on-github-pa` · Prepared 2026-09-21 08:35 UTC, refreshed 08:36 UTC after the eval review and the constraint audit
Risk tier: 2 (the Vite config and the deploy workflow are edited; the profile forces tier 2 for both, and the workflow is the only path that publishes the site)
For the agents: [spec.md](./spec.md), [plan.md](./plan.md), [evals.md](./evals.md), [adr/](./adr/)

This is the Design document. A person reads it in under five minutes, technical or not.

## The short version

You asked that every page address the site defines answer "200, here it is" instead of "404, not found" when a crawler or a link-preview service asks for it, so a shared case-study link gets a preview. The build will place a copy of the site's shell at each of those addresses (the work index and the three case studies), a check will refuse to publish if any copy is missing or wrong, and the deploy's own smoke test will fetch one case-study link and insist on 200. The one thing worth knowing: the preview will now appear, but it will show the site-wide title and description for every page, because the copies are identical; a per-page title is a separate, larger change that this design records but does not do.

## Problem

In your words: deep links such as `/work/<slug>` return HTTP 404 to crawlers and link previews because GitHub Pages serves a static 404 page for any path that is not a file, so a shared case-study link shows no preview. The earlier design (change 2026-09-11, ADR 0002) accepted that as a trade-off.

Restated precisely: GitHub Pages only serves files. The site is one JavaScript app, and the only file the build writes is the home page, plus a copy of it named `404.html` that Pages sends, with a 404 status, for anything else. A person's browser does not care about the status and renders the right page. Preview services and search crawlers read the status first and stop at 404. Today the app defines five addresses: home, the work index, and one page for each of the three case studies (confirmed from the case-study data and the app's route list).

## Outcome

When this is done:

- The build writes a copy of the finished home-page file at `work/` and at `work/<case study>/` for each case study. Pages then answers each of those addresses from a real file with status 200. The `404.html` copy stays, so an address the app does not define still answers 404 and still shows the site's own "page not found" page.
- The list of addresses comes from the case-study data itself, through one small module the build, the check and the tests all share. Adding a case study adds its page with no other edit. A test fails if someone adds a new kind of route to the app without extending that list.
- A new check runs in CI after the build and before anything is uploaded. It fails, naming the file, if any expected page is missing, differs from the home-page file, or if a page exists for an address the app does not define, anywhere in the build folder. It never passes when there is nothing to check, and it never prints a file's content into the public build log.
- The deploy's smoke test fetches `work/apple-llm-triage`, follows a redirect if Pages issues one, and fails unless the final answer is 200 with the same bytes as the home page. It also fetches a made-up address and requires 404, proving the fallback is still in place.
- At least twenty new automated tests prove all of the above (the plan lays out twenty-seven), and the profile puts the two new scripts under the same "ask me first" rule as the other CI guard scripts.

No dependency is added. No content changes. `package.json`, `index.html` and the case-study data are untouched.

## What changes for people

- Recruiters and anyone opening a shared link: the same pages as today, and services such as LinkedIn, Slack or iMessage now get a preview card, with the site's general title and description (believed, not verified: no preview service was exercised from here; the 200 status and the page's existing meta tags are what those services read).
- You: nothing day to day. During the build you will be asked to approve four edits: one to the Vite config, three to the deploy workflow. After the merge, the first deploy run's log shows the new check and the smoke result; because the Vite config changed, your usual four-item browser check applies once.
- CI: one more step in the build job, a few seconds at most, and a stricter smoke step. A missing or stale page now stops the deploy before upload instead of being found by a person.
- Search engines: the three case-study pages, which name Apple and Neural Newsletters and carry metrics, become individually indexable once they answer 200. The content itself is unchanged and already public (confirmed: the same pages have rendered on the live site since 2026-09-13). See D10.
- Anyone reading the code later: three ADRs explain why copies, why one list, and why the smoke follows a redirect.

## What could go wrong, and the guard for each

| Risk | Guard |
|------|-------|
| A case-study id that is not a plain directory name (a slash, a dot, an upper-case letter) could write a file somewhere unexpected | The list module rejects any such id with a clear message before anything is written, and the writer separately refuses any target outside the build folder; both are tested |
| A page is missing or stale in the build output | The CI check fails before upload, naming the file |
| A page lingers for a case study that was removed, or a stray page appears outside `work/` or deeper than a case study | The check walks the whole build folder and treats any page for an undefined address as a failure |
| The check echoes a stale or stray page's content into the public CI log | The check prints paths and byte counts only; two tests plant a marker string in such files and assert it never appears in the output |
| Pages redirects the shared link before answering | The smoke follows up to two redirects and logs how many happened; the first run records what Pages actually does |
| Someone adds a new route to the app without a page | A test reads the app's route list and fails on any pattern the page list does not know |
| Pages briefly serves the old files right after a deploy | The existing root-page retry runs first and must pass before the deep link is fetched |
| The workflow edit widens what CI may do | An existing test pins all permission blocks; a new one proves the added step uses no action and no permissions |
| Previews are generic for every page | Known and accepted (D4); pre-rendering is the recorded follow-up |

## Decisions

Approving this document accepts every recommendation; say otherwise in the approval notes to change one. D1 and D2 need your hand during the build: they are the ask-first files. D10 needs your answer, not your hand.

| # | Decision | Recommendation | Alternative | Why the recommendation |
|---|----------|----------------|-------------|------------------------|
| D1 | Edit `vite.config.js` (ask-first) so the existing build step also writes the route pages | Yes, one prompt | A separate post-build script wired into `package.json`, which is also ask-first | Keeps all Pages build behaviour in the one place readers already look; the earlier ADR rejected the alternative for that reason |
| D2 | Edit the deploy workflow (ask-first): add the check step and rewrite the deep-link smoke | Yes, three prompts | Add only the check and leave the smoke as it is | The request names the smoke; today's step says the 404 is by design, which becomes false |
| D3 | How the smoke treats a redirect on the shared link form (no trailing slash) | Follow up to two redirects, require the final 200, log the count | Fetch only the trailing-slash form, or rewrite every app link to end in a slash | Pages' redirect behaviour is believed, not verified from here; this assertion is true either way and the log shows which happened |
| D4 | Give each copy its own title and preview tags | Not now; copies are byte-identical | Per-page title and Open Graph tags, or full pre-rendering | Needs HTML rewriting per page kept in step with content; a separate change. Previews will show the site-wide text |
| D5 | Keep `404.html` and assert 404 on an unknown address | Yes | Drop the fallback now that real pages exist | An unknown slug should be a 404 to crawlers, and the not-found page still renders; the assertion also guards the fallback |
| D6 | Put the two new scripts under "ask me first" and the tier-2 floor | Yes, next to the other CI guard scripts | Leave them unguarded | They decide what Pages serves and what CI blocks; same precedent as the earlier guard scripts |
| D7 | Where the page list lives | One module fed by the case-study ids | A hand-kept list in the config, or parsing the app's route file | A hand-kept list goes stale and the check would then prove a stale list |
| D8 | A page for an address the app does not define fails the check | Yes | Ignore extra files | Such a page answers 200 while showing "not found", which misleads crawlers |
| D9 | Which documents are corrected | The hosted-config check list, one bullet in the codebase map, and the status line of the earlier ADR | Also rewrite the codebase map's stale "no router" architecture section | That section has been stale since 2026-09-11 and is unrelated to this change; noted for a documentation change |
| D10 | The case-study pages become individually indexable, and `docs/sdlc/constraints.md` open question 1 (are the employer-named metrics yours to publish, and is any Apple, TCS or Neural Newsletters detail confidential) has no recorded answer (confirmed: no `approvals.md` under `docs/sdlc/` mentions it). Only you can answer; this is not a design choice the agents can take | Answer it in your approval notes: "confirmed, mine to publish" lets the build proceed unchanged. If any detail is confidential, reject with notes and change the content first; only you edit the case-study data | Proceed without an answer, as the 2026-09-11 deploy did; or hold the change until you have answered | The pages are already public and unchanged, so the exposure is indexing, not disclosure; but published pages are copied by search engines and archives, so the answer belongs on record before this merge, not after |

## How it will be proved

The constraint audit passed: 0 high, 0 medium, 7 low notes recorded in the spec's "Constraint audit" table (confirmed); none blocks approval, and low 4 is D10 above.

The profile checks on the finished branch: `npm ci`, `npm run lint`, `npm test`, `npm run build` all exit 0, and the dependency audit is unchanged. The eval cases in `evals.md`, as written: 13 golden, 4 edge, 8 failure, 5 adversarial, 2 non-functional plus one measured count, 32 in total, every one runnable by a machine here (confirmed against `evals.md` and the plan's task steps). Twenty-seven are permanent tests in four new files; the other five are commands with an expected result (the five matching file digests after a build, the check script exit code and its timing, the document greps, the empty diff on the protected files), and the measured count is the test total itself, which must rise by at least twenty with none skipped. The live half, the served status on the real site, is shown by the first deploy run after you merge and recorded in the release document; the smoke text that produces it is tested before.

Done, in one sentence: on this laptop and in CI, the build writes four route pages identical to the home page, the check passes on them and fails on any fixture that breaks the rule, and after the merge the deploy log shows `work/apple-llm-triage` answering 200 and a made-up address answering 404.

## Estimate

Waves: 3. Tasks: 3. Agent-time budget at tier 2: 90 minutes. Design so far: about 15 minutes (confirmed, `wh.js clock`: 14.6 agent minutes).

## Your decision

Approve to build it exactly this way, or reject with notes to have it redesigned. If you approve, please include your answer to D10 in the notes.
