# 0001: Refuse to inline font files with a font-only `assetsInlineLimit` function

Date: 2026-09-13
Status: proposed
Change: 2026-09-13-no-inlined-data-font-urls-in-built-css

## Context

R93 and R94. Vite 5.4.21 inlines any asset under 4096 bytes as a base64 `data:` URL (confirmed by the conductor:
`node_modules/vite/dist/node/constants.js` line 109). Twelve JetBrains Mono files, 8 `.woff2` and 4 `.woff` of 1152 to
4040 bytes, land in the built CSS that way, and the CSP's `font-src 'self'` blocks them (change 2026-09-11, ADR 0006).
The intent rules out adding `data:` to `font-src` and dropping subsets; the owner chose a font-only function at G1
(Q1). The option accepts a function: `false` emits a file, and `undefined` falls back to the default (confirmed by the
conductor: `index.d.ts` line 2401, `dep-BK3b2jBa.js` lines 20473 to 20488). A test cannot load `vite.config.js`
itself. Under the default jsdom environment the import fails at load on esbuild's `TextEncoder` invariant, and a Node
environment pragma fails in `src/test/setup.js`, which reads `window` before every test file (both confirmed by the
conductor; spec audit M5).

## Decision

`scripts/never-inline-fonts.mjs` exports one function, `neverInlineFonts(filePath)`, and imports nothing. It returns
`false` when the path ends in `.woff2`, `.woff`, `.ttf`, `.otf` or `.eot`, ignoring case, and `undefined` for every
other path. It matches the extension, not a directory, because Vite passes an absolute path with forward slashes on
Windows (confirmed by the conductor). Its comment says why: the CSP allows fonts from `'self'` only. `vite.config.js`
imports it and sets `build: { assetsInlineLimit: neverInlineFonts }`. Vite bundles that relative import into the
config (confirmed: `dep-BK3b2jBa.js` lines 66851, 66890 and 66891). `src/neverInlineFonts.test.js` tests both return
values, and R97 checks the build result on every CI run.

## Alternatives

| Option | Why not |
|--------|---------|
| `assetsInlineLimit: 0` | Same output today, because all 128 calls are for fonts (confirmed by the conductor). But it would also stop Vite inlining any small image added later, which `img-src 'self' data:` allows. |
| A smaller number, such as 1024 | The largest inlined file is 4040 bytes. Any threshold is a guess that the next `@fontsource` release can cross. |
| `font-src 'self' data:` | Ruled out by the intent. It widens a security policy to suit a build default. |
| Import only the latin subset | The owner kept every subset (G1 Q4), and it would change which glyphs ship. |
| Keep the function in `vite.config.js` and drop its unit test | Nothing would prove the `undefined` branch, which carries the owner's G1 Q1 choice to keep small images inlining. No real build calls it today (confirmed by the conductor, `probe-output.json`). R97 would still prove the `false` branch. |
| Keep it in `vite.config.js` and test through the default export (spec revision 1) | The import fails at load under jsdom, and a Node pragma fails in the shared setup file (confirmed by the conductor). |
| Put the module under `src/` beside its test | `src/` is the browser app. The repo already keeps build-time Node code in `scripts/` and tests it from `src/` (`src/checkPhoneRedaction.test.js`). |
| A build plugin that rewrites the CSS | It would reimplement Vite's asset pipeline to solve what one option solves. |

## Consequences

- Easier: both return values are tested on every `npm test`, and the test loads no Vite, plugin or native binding.
- Easier: the stylesheet sheds 27,544 bytes of raw font data, about 36.7 KB as base64 (believed, arithmetic on the
  conductor's file sizes, not a measurement).
- Cost (spec audit M6): the decision leaves `vite.config.js`, which the profile guards with an edit prompt and a tier-2
  floor (`.workhorse/profile.yml` lines 76 and 154, confirmed), for a file neither covers. A later change that edits
  only the module prompts no one and is not forced to tier 2 (believed; the classifier decides), though G4 stays
  required at every tier (WorkHorse `hooks/scripts/lib.js` lines 183 to 203, confirmed). The guards, R97's script and
  both new tests, sit in files just as unprompted. R93's `^import` grep misses a dynamic `import(` that does not start
  a line, and the R97 script, the first repository file run between Build and upload, could be edited to write to
  `dist/`. Spec OQ4 and D6 ask the owner to add both `scripts/` files to both lists himself, after G2. `scripts/` now
  also holds a module that is imported, not run, and its comment says so.
- Cost: a function sits where a number would do today, relying on Vite's rule that `undefined` means "use the
  default". The build emits twelve more files, each fetched only when the page renders its `unicode-range` (believed).

When to revisit: on any Vite major upgrade, because the option's contract may change. If fonts inline again, R97
fails the build job before anything is uploaded.
