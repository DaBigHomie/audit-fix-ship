# /start — ATB Session Startup (Prime Boot)

Run this at the start of every session on the `atl-table-booking-app` repo.

## Steps

1. **Read cortex boot context**

```bash
cat /Users/dabighomie/Management\ Git/atl-table-booking-app/.cortex-boot.json
```

2. **Git state**

```bash
cd /Users/dabighomie/Management\ Git/atl-table-booking-app && git branch --show-current && git status --short && git log --oneline -5
```

3. **Open PRs + issues**

```bash
cd /Users/dabighomie/Management\ Git/atl-table-booking-app && gh pr list --state open && gh issue list --state open --limit 10
```

4. **Task list**

Use TaskList tool to show all pending/in-progress tasks.

5. **Read HANDOVER.md if it exists**

```bash
cat /Users/dabighomie/Management\ Git/atl-table-booking-app/HANDOVER.md 2>/dev/null || echo "No handover doc"
```

6. **Source env credentials**

```bash
source /Users/dabighomie/Management\ Git/.env.mcp 2>/dev/null
```

7. **Report back** with:
   - Active branch
   - Last 3 commits
   - Pending tasks (from TaskList)
   - Any blockers from HANDOVER.md
   - What to work on next
