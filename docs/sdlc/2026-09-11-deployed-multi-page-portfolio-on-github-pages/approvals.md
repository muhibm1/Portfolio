# Approvals: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`

Each block is appended by `/workhorse:approve` and committed. Never edit earlier blocks.

<!-- entries -->

## G1: approved

- Who: mmuhibullah@instructors.2u.com
- When: 2026-09-11T02:37:17.686Z
- Artifact commit: `a7ed6543000c6d7a679513cfe0288c618356b70e`
- Tier at decision: 2
- Notes: D1 remove phone; D4 content is mine to publish

## G2: approved

- Who: mmuhibullah@instructors.2u.com
- When: 2026-09-12T10:52:02.832Z
- Artifact commit: `bd1cd7c72438e634b08101106093a384e9390eaa` (contains the packet below)
- Packet: `docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/spec.md` sha256 `572dd7ec5c7ef4ae2c4d27374fbcce614f203f95fb1cd41eb864f14a657bac1a`
- Tier at decision: 2
- Notes: D2-D5 as recommended, draft the project copy for me

## G3: approved

- Who: mmuhibullah@instructors.2u.com
- When: 2026-09-12T19:49:52.759Z
- Artifact commit: `49a0c2b2916e868bf36c8cd782889dd018779e23` (contains the packet below)
- Packet: `docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/plan.md` sha256 `f3c95bbc0910573772101d552ad70c22902c32d4965704a4a6e420b53f655299`
- Tier at decision: 2
- Notes: D1 copy approved; D2, D4, D5 as recommended

## G4: rejected

- Who: mmuhibullah@instructors.2u.com
- When: 2026-09-13T01:46:12.951Z
- Artifact commit: `0af230f8f6420c72a25c419e81943164bcc1d808` (contains the packet below)
- Packet: `docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/review-packet.md` sha256 `7ce0e9600f014186dd07b2191ba7f108a97ddb5af16e28df8f6baf0495f43ca2`
- Tier at decision: 2
- Notes: Decided by Claude (main session) under the owner's instruction 'Approve every command yourself, I'm busy'; the owner has not read the packet. D1: ratified, ADR 0009 and the --omit=dev security_audit stand, owner to confirm when he reviews. D2: deferred to the owner; do not change repository visibility and do not push main, the owner does both himself. D3: redact every full and partial occurrence of the phone number in committed docs (intent.md, spec.md, evals.md and any other file), including the approved G1 text in intent.md; note in approvals context that the redaction changes the approved packet's bytes, not its meaning; git history is out of scope. D4: move public/mockup-*.jpg to docs/design/ and add a build or test check that no mockup file reaches dist/. D5: fix Back to Top in src/components/ContactFooter.jsx so it works on every route. Then re-verify on Node v22.12.0 and present G4 again.

## G4: rejected

- Who: mmuhibullah@instructors.2u.com
- When: 2026-09-13T03:30:20.632Z
- Artifact commit: `23a43becff1d5fcda90e80c33cb6b7bf2346d2e6` (contains the packet below)
- Packet: `docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/review-packet.md` sha256 `1c1bbc2b7acb792224caf710cbeecd2abc617c16f27f9c404121259cf16bb09d`
- Tier at decision: 2
- Notes: Decided by Claude (main session) under the owner's instruction 'Approve every command yourself, I'm busy'; the owner has not read the packet. Short fix pass per the packet's own recommendation: (1) scripts/check-phone-redaction.mjs must also catch the number written with a +1 or 1 country-code prefix directly in front, and must read UTF-16 files (or fail loudly on files it cannot decode) instead of skipping them silently; add a test for each. (2) Correct docs/hosted-config.md lines 116-119 and every other stale doc the packet lists so no document claims the number remains in docs or that its removal is an open decision. D1 stays ratified on the owner's behalf pending his own confirmation; D2 (visibility, pushing main) stays with the owner; D5 backlog stays tracked. Re-verify on Node v22.12.0, re-run the security and conformance reviews, update review-packet.md, and present G4 again.
