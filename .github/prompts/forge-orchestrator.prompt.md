---
description: "Run Content Forge (Swarm-18) orchestration — mode pick, sequencing, delegation to sai-post-production and specialists."
argument-hint: "Session id, asset path, or brief goal (e.g. 'markers on build #42 to Shorts')"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/forge-orchestrator.prompt.md -- do not edit; run sync-agents.mts -->

# Forge orchestrator shortcut

Invoke the forge orchestration agent:

```
@forge-orchestrator Orchestrate Content Forge for: $input
```

The agent will:

1. Detect whether **`maximus-ai`** Social Automation backend files exist (`src/features/social-automation/`).
2. Choose **AI Clipper**, **marker**, or **turnkey (`sai-post-production`)** path.
3. Emit a concise handoff row (next delegate agent + checklist).
4. Avoid capture (OBS) and publishing unless you explicitly widen scope afterward (`@sai-orchestrator`).

For turnkey post-production including transcription and captions in one delegation, prefer:

```
@sai-post-production Process capture or assets for: $input
```
