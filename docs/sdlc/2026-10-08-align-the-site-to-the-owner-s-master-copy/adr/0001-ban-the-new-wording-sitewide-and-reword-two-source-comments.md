# 0001: Ban the vendor, plugin and decision-authority wording sitewide and reword two source comments

Date: 2026-10-08
Status: proposed
Change: 2026-10-08-align-the-site-to-the-owner-s-master-copy

## Context

R3 and R12 add eighteen terms to `scripts/forbidden-copy.mjs`. Its default scope is every
non-test file under `src/`, `index.html` and `docs/design/og.svg`, plus every `.html` under
`dist/` when CI passes that argument (confirmed, `resolveScope`). A grep of that scope found
three legitimate uses of words the owner bans: "Live status via WebSockets"
(`src/data/portfolioData.js` line 904) and the comments "Self-hosted typefaces" (`src/main.jsx`
line 4) and "Self-hosted families" (`src/index.css` line 3). Everything else that matches is
copy the document removes. The owner's rule for "via" is any form; the request asks that "via"
not trip on ordinary words such as "service" or "deviate".

## Decision

We add every term to `FORBIDDEN_TERMS` with no path scope and no extension skip, word-bounded
where the term is a word (`via`, `messy`, `TCS`, `Tata`, `Ollama`, and the pattern terms for
contractor, vendor, consultancy, plugin, decision system). We reword the three legitimate uses
in the same change: "over WebSockets", "Bundled typefaces", "Bundled families". Each new term
carries a one-line comment naming the document rule it enforces, the convention the 2026-09-29
reviewers asked for.

## Alternatives

| Option | Why not |
|--------|---------|
| Scope the new terms with `onlyPaths` to `src/data/` and `dist/**/*.html` | Adds a second scope rule to explain and leaves comments unscanned, where a removed claim can quietly survive and be copied back into copy later. |
| Carve `skipExtensions: ['.css']` and a lookahead for "typefaces" into `self-hosted` | Two special cases to protect two comments that cost one word each to change. |
| Match "via" only when followed by TCS or a vendor noun | Misses the paraphrases the owner names (contractor, consultancy) when they appear without "via", and the request asks for the bare word on a boundary. |

## Consequences

Easier: one rule, "the word is banned everywhere the scanner looks", with no exceptions to
remember. The real-tree scan in `src/copyIsClean.test.js` stays a true check. Harder: a
future engineer who wants to write "via" in a code comment under `src/` will hit the scanner and
must choose another word; the hit names the term, so the cost is one edit. The scanner task must
land after the copy task (change 2026-09-29 ADR 0003), or the real-tree scan is red on its own
branch.
