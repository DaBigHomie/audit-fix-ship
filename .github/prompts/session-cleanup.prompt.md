---
description: "Run full session cleanup: verify commits, clean branches/worktrees, close terminals, and generate a combined Context Manifest + Handoff document. Use at end of every CLI session."
argument-hint: "Which repo(s) to clean up? (damieus, 043, ffs, maximus, cae, ugwtf, handoff, or 'all')"
---

# Session Cleanup & Handoff Generator

You are running the **30x Session Cleanup** orchestration. This combines `/context-manifest` and `/generate-handoff` into one end-of-session pass.

## ⛔ Safety Rules

- **NEVER delete the current working directory**
- **NEVER run recursive delete commands (rm -rf, rm -r)**
- **ALL destructive operations (branch delete, process kill) require explicit user confirmation**
- **Documentation output goes to `~/management-git/{repo}/docs/context-manifests/` — never CWD or temp dirs**

Invoke the Session Cleanup agent:

```
@session-cleanup Run full session cleanup for {argument or auto-detect active repos}
```

Or run steps individually:

**Step 1 — Git verification only:**
> Verify all commits are pushed and repos are synced to main. Suggest Code Review Agent if there are uncommitted changes.

**Step 2 — Branch & worktree cleanup (report-only):**
> List merged/used branches and worktrees. Present a table of what WOULD be deleted. Wait for user confirmation before deleting anything.

**Step 3 — Terminal cleanup (report-only):**
> List open terminal sessions, dev servers, and background processes. Present PIDs in a table. Wait for user confirmation before killing anything.

**Step 4 — Generate docs only:**
> Generate a combined Context Manifest + Handoff document using TypeScript string replacement, following documentation-standards. Save to `~/management-git/{repo}/docs/context-manifests/{YYYY-MM-DD}_{HH-mm}/`.

**Step 5 — Full orchestration (default):**
> Run all steps 1–4 in sequence. Generate cleanup summary at the end.

---

## Documentation Output

The generated docs use **TypeScript-based string replacement** (`{{key}}` → actual value) and follow the documentation-standards repo patterns:

```
~/management-git/{repo}/docs/context-manifests/{YYYY-MM-DD}_{HH-mm}/
├── CONTEXT_MANIFEST.md   ← follows context-manifest.prompt.md format
└── HANDOFF.md            ← uses 00–05 handoff template structure
```

## Cross-Agent Workflow

- If dirty working tree → invoke **@code-review** first
- If pre-deploy cleanup → invoke **@deploy-gate** after
- For full 15-template handoff → use `~/management-git/handoff-framework`

## Reference Files

- Agent definition: `.github/agents/session-cleanup.agent.md`
- Existing context manifest prompt: `.github/prompts/context-manifest.prompt.md`
- Handoff framework: `~/management-git/handoff-framework/.github/prompts/generate-handoff.prompt.md`
- Doc standards: `~/management-git/documentation-standards/STANDARDS.md`
