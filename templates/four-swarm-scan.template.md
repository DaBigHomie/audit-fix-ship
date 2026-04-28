# 4-Swarm Source-vs-Tracker Scan — Template

Use this AFTER producing the stakeholder tracker, to find specifics that got compressed out during summarization.

## When to run this

- Source material is a **long meeting transcript** or screen-share recording
- Stakeholder is **non-technical** and used pointing/screenshots rather than precise language
- You suspect **verbatim copy** or **specific image references** got summarized away
- The tracker reads as "directives" rather than "specifics"

Skip if the source was already a written punch list with all specifics inline.

## How to run

For each swarm below, scan the source material independently. Look for the category of detail listed. Compare to the tracker. Output the missing items in the format below.

---

## Swarm 1 — Visual & Image References

> Scope: every image, mockup, photo, asset, or visual element the stakeholder named or described.

For each visual the stakeholder referenced:

- Did the tracker name it? (label in the tracker should match)
- Did the tracker describe it? (the asset filename or visual contents)
- Did the tracker capture renames? (if the stakeholder is renaming a thing, both old and new label must appear)
- Did the tracker capture exact paths or crop specs? (e.g. `/images/foo.webp` with `object-position: center 35%`)

Common misses:
- Image descriptions compressed to just labels ("the couple photo" → loses content of the photo)
- Renames captured as one-way (new name in tracker, old name not flagged for removal)
- Crop / position / size specs lost ("35% margin" interpreted as `clip-path` rather than `object-position`)

---

## Swarm 2 — Copy & Content Verbatim

> Scope: every direct quote, exact phrase, tagline, or copy change the stakeholder specified.

For each copy item:

- Did the tracker capture the **exact words**? (not paraphrase)
- Did the tracker capture **examples** the stakeholder gave? (e.g. "replace 'Rock our pieces' with 'Wear your favorite fit'")
- Did the tracker preserve **continuations**? (if stakeholder said "the body flows through to ..., then ends with ...", both ends matter)
- Did the tracker capture **what to keep** vs what to remove? (some items are reposition not delete)

Common misses:
- Bullet-point summaries lose the verbatim
- "Reposition" instructions read as "delete"
- Sub-elements of a section ("remove the 3 sub-boxes that say X, Y, Z") collapsed to "remove sub-boxes"
- Taglines / headers omitted in favor of section descriptions

---

## Swarm 3 — Layout & Structure

> Scope: sizing, spacing, grids, breakpoints, structural arrangement.

For each layout call-out:

- Pixel sizes captured? (e.g. "280–320px tall on desktop")
- Grid arrangements captured? (e.g. "3×2 desktop, 2×3 tablet")
- Breakpoint behavior captured?
- Structural element counts captured? (e.g. "reduce to 4 boxes" — which 4? exclude which?)
- Constraints captured? (e.g. "approximately equal character counts")

Common misses:
- Relative descriptions ("larger") without concrete specs
- The element being explicitly removed when a count changes
- Equal-length / proportional constraints
- Specific font/treatment selections from a multi-option set

---

## Swarm 4 — Behavior, Bugs & Out-of-Scope Context

> Scope: bugs not captured, implementation details for known items, out-of-scope but important context.

For each behavior / bug call-out:

- Did the tracker capture every bug as its own item? (caching bugs often collapse with overlay bugs)
- Did the tracker preserve **implementation details**? (e.g. "long-lived token", "ISR revalidate every 15 min", "fallback to hardcoded 6")
- Did the tracker capture the **reproduction path**? (e.g. "Jay reproduces via Google SSO" — the auth provider matters)
- Did the tracker capture **partial findings**? (where the source clipped before the stakeholder finished)
- Did the tracker capture **out-of-scope context** worth tracking for visibility? (drop calendar, manufacturing scope, side conversations)

Common misses:
- Distinct bugs lumped into one tracker item
- Implementation specifics ("long-lived token", not just "token") lost
- Auth / provider / device specifics lost
- Process steps (testing tools, walk-through requirements) absent
- Out-of-scope context with no place to live in the tracker

---

## Output format

Produce a markdown doc with this structure:

```markdown
# 4-Swarm Source-vs-Tracker Scan

**Source:** {description}
**Tracker:** {file path}
**Method:** 4 parallel swarms

## TL;DR

{N} specific details missing or under-specified, split as:

| Swarm | Findings | Severity |
|-------|----------|----------|
| 1. Visual & Image | {N} | High/Medium/Low |
| 2. Copy & Content | {N} | High/Medium/Low |
| 3. Layout & Structure | {N} | High/Medium/Low |
| 4. Behavior, Bugs & OOS | {N} | High/Medium/Low |

Of {N}, **{M} are net-new tracker items**. The rest are sub-specs to fold into existing items.

---

## Swarm 1 — Visual & Image References

### 1.1 {Finding title}

{Tracker says X. Verbatim source said Y. Action: Z.}

| # | Tracker name | Verbatim from source | Goes in |
|---|---|---|---|

### 1.2 ...

---

## Swarm 2 — Copy & Content Verbatim

### 2.1 ...

---

## Swarm 3 — Layout & Structure

### 3.1 ...

---

## Swarm 4 — Behavior, Bugs & Out-of-Scope

### 4.1 ...

---

## Net-new tracker items proposed

| New ID | Title | Rationale | Severity |
|---|---|---|---|

---

## Refinements to existing items

| Item | Refinement |
|---|---|

---

## Out-of-scope context to track for visibility

{Bulleted list of things the stakeholder mentioned that aren't code work but matter for the relationship.}

---

## Notes on the scan

{Caveats: where verbatim quotes came from, what fidelity to expect, whether the source is reliable enough to lock copy on.}
```

## Token cost

A 4-swarm scan over a 30-issue tracker against a 60-min meeting transcript: roughly 8–12k tokens of output. Worth it when you suspect drift; skip when the source was already structured.
