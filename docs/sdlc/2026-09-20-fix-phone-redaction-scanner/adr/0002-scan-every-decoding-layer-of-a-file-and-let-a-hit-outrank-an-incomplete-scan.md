# 0002: Scan every decoding layer of a file and let a hit outrank an incomplete scan

Date: 2026-09-20
Status: proposed
Change: 2026-09-20-fix-phone-redaction-scanner

## Context

`decodeText()` in `scripts/check-phone-redaction.mjs` lines 250 to 256 picks one decoder for the
whole file: a UTF-16 byte-order mark wins, then "no zero byte" means UTF-8, then a byte-offset
rule means BOM-less UTF-16LE. Confirmed on this host with the synthetic reference: a file that
starts with a UTF-16LE or UTF-16BE mark and ends with an even-length UTF-8 region holding the
number, and a file with an even-length UTF-8 head holding the number followed by a longer
BOM-less UTF-16LE tail, all exit 0 with 0 hits. The region holding the number is decoded with the
wrong decoder and becomes CJK-looking text. This is a security check (R89, ADR 0010 of change
2026-09-11); a missed hit is a false green (R1 to R4).

## Decision

We separate finding hits from judging completeness. Every non-binary file is scanned in its
UTF-8 decoding. If the file holds at least one zero byte it is also scanned in four more
layers: UTF-16LE from byte 0, UTF-16LE from byte 1, UTF-16BE from byte 0 and UTF-16BE from
byte 1, each dropping a trailing odd byte. Hits are the union across layers, deduplicated by
path, line and form. Files with no zero byte get only the UTF-8 layer, because an ASCII digit in
any UTF-16 layer needs a zero byte (confirmed: UTF-8 digits decoded as UTF-16 give no digit).
Completeness keeps the current classification: a file is "undecodable" when it holds a zero
byte and matches no recognised layout, and such a file with no hit still fails with exit 2. The
exit code is 1 if any hit was found, else 2 if any file was undecodable or none was scanned,
else 0. Report lines keep their format and never hold matched text or a reference digit.

## Alternatives

| Option | Why not |
|--------|---------|
| Better whole-file detection (segment the file at encoding boundaries) | A boundary detector is a heuristic with its own misses, and a reader cannot verify it; scanning every layer has no boundary to get wrong |
| Treat any file with a zero byte as undecodable, exit 2, no scan | Loses the hits the layers can find and pushes every UTF-16 file to a human; the existing UTF-16 tests would also break |
| Drop the "undecodable" class now that every layer is scanned | UTF-32, EBCDIC or compressed text would then read as clean; the request says a file the check cannot decode with confidence must not be reported clean |
| Keep exit 2 above exit 1 when both apply | A planted number would exit 2, which reads as "could not run" rather than "found"; the red-team tests expect 1 |

## Consequences

Easier: the number is found in any UTF-8 or UTF-16 region at any alignment; no decoder choice
can hide it. Harder: a file with zero bytes is scanned five times (cost bounded by N1);
line numbers for a hit inside a mixed file come from the layer that found it and may not match
an editor's count; one existing test changes contract (a zero-byte file holding the number now
exits 1, not 2, see spec D3). Accepted limitation: a number whose digits straddle an encoding
boundary is not a hit in any single layer; such a file is unreadable to a person as well.
