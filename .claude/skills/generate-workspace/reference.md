# generate-workspace — Reference

Full schema and merge semantics for the workspace factory.

## `.workspace.config.json` schema

```ts
interface WorkspaceConfigFile {
  // REQUIRED — repo identity
  repo: {
    name: string;          // Display: "Career Corpus"
    slug: string;          // Dir name: "career-corpus" (MUST match directory)
    alias: string;         // Short: "cc" (used for Cursor folder names + handoff tags)
    techStack: string[];   // ["TypeScript", "Supabase", ...]
    owner: string;         // GitHub owner — "DaBigHomie"
    packageManager: string;// "npm" | "pnpm" | "yarn" | "bun"
    description: string;   // One-line — appears in projects.json + .handoff.config.json
  };

  // OPTIONAL — CORTEX boot paths (relative to repo root)
  cortex?: {
    agentKbPath?: string;  // default: "../.agent-kb"
    dbPath?: string;       // default: "../.agent-kb/db/agent_kb.sqlite"
    anvilSpec?: string;    // default: "../.agent-kb/11-ANVIL.md"
  };

  // OPTIONAL — repo-specific quality gates
  // default: { typescript: { command: "npx tsc --noEmit", required: true, enabled: true } }
  qualityGates?: Record<string, {
    command: string;
    required: boolean;
    enabled: boolean;
  }>;

  // OPTIONAL — override the shared utility-repo set
  // default: image-gen-30x-cli, audit-orchestrator, ugwtf, documentation-standards,
  //          damieus-workflow-agents, Management
  utilityRepos?: { name: string; path: string; alias: string }[];

  // OPTIONAL — Prime Gate Cursor hooks (installed on generate when cortex is set)
  primeGate?: {
    installHooksOnGenerate?: boolean;  // default: true when cortex block present
  };

  // OPTIONAL — override the Antigravity _inactive_folders reserve list
  inactiveRepos?: { name: string; path: string }[];
}
```

## Merge semantics

| Field | Behavior |
|---|---|
| `repo` | REQUIRED — no defaults; missing keys throw. |
| `cortex` | Shallow-merged into defaults (`{...DEFAULT_CORTEX, ...config.cortex}`). |
| `qualityGates` | Replaced wholesale if present. To keep defaults, copy them in. |
| `utilityRepos` | Replaced wholesale if present. |
| `inactiveRepos` | Replaced wholesale. Any entry whose `path` matches an active folder is auto-filtered. |
| `excludePatterns` | Not configurable per repo — sourced from `DEFAULT_WATCHER_EXCLUDES` / `DEFAULT_SEARCH_EXCLUDES`. |

Repo-root governance defaults (always written into `projects.json`):

```json
{ "malfig": true, "zeroEmoji": true, "zeroProse": true, "taskIdentifiers": true }
```

## Per-repo files written

```
~/management-git/<slug>_antigravity.code-workspace   # Antigravity
~/management-git/<slug>.cursor.code-workspace        # Cursor
~/management-git/<slug>.code-workspace               # VS Code
~/management-git/<slug>/projects.json                # MALFIG manifest
~/management-git/<slug>/.handoff.config.json         # Handoff framework v3.1.0
~/management-git/<slug>/.cursor/hooks/               # Prime Gate hooks (when cortex configured)
~/management-git/<slug>/.cursor/hooks.json
```

## CLI

```
--repo <slug>           REQUIRED. Directory name under ~/management-git.
--dry-run               Preview file paths + sizes; write nothing.
--init                  Copy templates/workspace/workspace.config.json to
                        <repo>/.workspace.config.json. Refuses to overwrite.
--skip-prime-gate       Skip syncing .cursor/hooks from SSOT template.
```

Exit codes:

- `0` — success (write or dry-run).
- `2` — missing `--repo`, repo dir not found, config missing, slug mismatch.

## Manifest skeleton (for `/exit` handoff after onboarding a repo)

```md
# Workspace onboarded: <slug>

Repos touched:
- documentation-standards (canonical generate-workspace.mts)
- <slug> (added .workspace.config.json, projects.json, .handoff.config.json)

Generated workspace files at ~/management-git root:
- <slug>_antigravity.code-workspace
- <slug>.cursor.code-workspace
- <slug>.code-workspace

Next steps:
- Register in documentation-standards/workspace-rules/repo-registry.json
- Add to AGENT-CONTEXT-KEY load order if active
```
