Verdict: 3 findings (0 critical, 0 high, 2 medium, 1 low)

Scope: `git diff main...HEAD -- . ':!docs/sdlc'` at b694061 (13 files), plus the callers and data the findings need.

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| medium | src/data/portfolioData.js:620 (with src/components/CaseStudyFlowDiagram.jsx:12, 28) | The new six-column decision flow is too narrow at desktop widths, so step titles spill out of their boxes | Someone opens /work/apple-llm-triage at 768 to 1440px wide. Each `<li>` is 54px (viewport 776), 91px (1000) or 119px (1416), and the title spans are 30, 67 and 95px wide. Measured scrollWidth: at 776 all six titles overflow (53 to 115px); at 1000 "Documented recommendation" (115), "Check against internal specification" (89) and "Geospatial snapshot..." (72) overflow; at 1416 "recommendation" is 115 against 95, so it runs 8px past the box border into the 8px gap. Expected: every title wraps inside its box. Confirmed in headless Edge against the built `dist` (the copy in the scratchpad), using the real CSS and the bundled fonts. At 676 and 492 (2 and 4 columns) nothing overflows. Eval gap: no eval checks rendered width. E3, E10 and E12 check the data and the markup only. Plan item 13 leaves 390/768/1440 rendering as a manual check | Owner decides (spec R5 and E3 fix `columns: 6`). Option A: add `break-words hyphens-auto` to the title span in CaseStudyFlowDiagram.jsx:28 (`<html lang="en">` is present, so hyphenation works). Option B: give 6 its own class, `'md:grid-cols-3 xl:grid-cols-6'`. That does not fix 1416px by itself, so pair it with A |
| medium | public/og.png (served as og:image by src/pageMeta.js:10) | The share image still reads "Tickets decided a day", a phrase this change bans | At b694061, og.svg says "Tickets a day" but public/og.png has not been re-rendered. Confirmed by viewing the PNG. Any LinkedIn or Slack preview of any route shows "Tickets decided a day". Expected: "Tickets a day". The scanner skips binary files and no test reads inside the PNG. This is tracked as brief D13 / evals.md line 86 and is still open on this branch | Re-render public/og.png from docs/design/og.svg (docs/hosted-config.md "Regenerating og.png") before merge. This is a human step under D13 |
| low | src/components/CaseStudyFlowDiagram.jsx:26; src/masterCopy.test.jsx last case | `data-gate="true`, documented as the marker for "the human decision", also lands on gate steps that are not human decisions. Eval E31 is not implemented as written | Counted in the built dist (confirmed): decision page 1, Neural 1 ("Reader", "Live status over WebSockets"), WorkHorse 3 (including Studbook "Receipts"). E31 expects exactly 1 across all routes and 0 on Neural and WorkHorse. The route test instead expects `gateStepCountInData(path)`, which matches the code. A grep for `data-gate` used to find the human decisions returns 5 steps, and 2 of them are not decisions by a person. Spec R5 ("a gate step SHALL render ... data-gate") and E31 disagree | none proposed. Owner decision: either add a separate step flag for a human decision and emit `data-gate` only from that flag, or restate E31 to match R5. Note the gap in the Ship document |

Checked with no finding (confirmed by reading the code):
- `FLOW_DESKTOP_COLUMNS_CLASS` already has 6.
- No reference to the old section id `safe` remains in src, scripts, index.html, public or .github. The on-this-page nav builds its links from the data.
- The `step.note &&` guard renders no span when `note` is missing.
- The subtitle renders only when set.
- Previous/next neighbour order (decision, then integration) matches both cross-reference sentences.
- The new string terms are word-bounded through LETTERS_ONLY, or matched as substrings when they contain a space or hyphen.
- The ZERO_REJECTED lookbehind does not match "10 rejected".
- `node scripts/check-forbidden-copy.mjs dist` exit 0, "40 files scanned" (run by this reviewer). The dist build is from 03:51Z, the same build the verify summary records.

Findings outside scope: The home meta description is now the full hero lead, about 370 characters, so search results will truncate it. This is a wording matter, not a bug.

Not verified:
- Browser widths below 492px: headless Edge would not size its window narrower.
- Other routes' flow diagrams at desktop widths. They existed before this change and fall outside this diff.
- Safari and Firefox rendering.

## Re-check (b694061..864e448, CaseStudyFlowDiagram.jsx, its test, scripts/forbidden-copy.mjs)

Verdict: 0 new findings. Overflow finding (medium, row 1) closed by CSS semantics; not measured in a browser.

- Overflow, closed (believed, not measured). The title span at CaseStudyFlowDiagram.jsx:27 now has `break-words hyphens-auto`. Confirmed in node_modules/tailwindcss 4.3.3: `break-words` emits `overflow-wrap: break-word`, `hyphens-auto` emits `hyphens: auto` and `-webkit-hyphens: auto`, and `md:grid-cols-6` is `repeat(6, minmax(0, 1fr))`. The `<li>` is `flex min-w-0 flex-col`, so the span stretches to the box width, and the `minmax(0, 1fr)` track does not grow to fit a long word. A word wider than the box therefore breaks inside it, at a hyphenation point if the browser has an English dictionary (`<html lang="en">` confirmed), else at any character.
- Neighbouring inputs. Other diagrams: the same span renders every `flow` block, so the 4, 5 and 8 column diagrams get the same wrapping (the 8 column one is the narrowest). Step with no note: the change is on the title span only; the `step.note &&` guard and the note classes are unchanged, and the new test pins `text-xs text-muted`. Long single word ("Recommendation", about 115px, in a 30px content box at 776px): it breaks into lines of about 3 to 4 characters each and stays inside the box (believed, not measured). Nothing spills out, but the boxes get tall and the words are hard to read between 768px and about 1000px. Option B from row 1 (`xl:grid-cols-6`) would fix that. The owner chose not to.
- Scanner (864e448). `APPROVE_REJECT_HOLD_TERM` behaves like the string term it replaces: the same label, the same case-insensitive substring match, and the same empty `skipExtensions` and null `onlyPaths` through `buildMatchers` (confirmed by reading lines 252-263 and 336-345). It adds an optional comma, and there is no `g` flag, so `pattern.test` keeps no state between lines. Neighbouring inputs: "Approve, reject, or hold" hits. "approve, reject and hold" and "approve or reject" do not (both are in the clean list of the new test). "approve, reject,or hold" without the space does not hit, and neither did the old term. The comment line in scripts/ is outside the scan scope. `node scripts/check-forbidden-copy.mjs` exit 0, "32 files scanned" (run by this reviewer, source scope only, not dist).
- 4565b15 comment rewording in forbidden-copy.mjs: comments only. No pattern or list order changed except the term swap above.

Findings outside scope: the new `APPROVE_REJECT_HOLD_TERM` export sits between the "plugin rule" comment and `PLUGIN_TERM`, so that comment now sits above the wrong constant. It does not change behaviour.
Not verified: the rendered wrapping at any width (no server, as instructed). Whether Edge or Chrome on Windows hyphenate or fall back to breaking at any character. `hyphens: auto` may also hyphenate titles that used to wrap whole at wider widths. That is a visual change, not an overflow. dist was not rebuilt or rescanned for this re-check.
