#!/usr/bin/env npx tsx
/**
 * Prime Gate — Cursor sessionStart hook (.mts only).
 * Resumes active session or opens one; skips duplicate boot when session already active for repo.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function findAgentKb(repoRoot: string): string | null {
  let dir = repoRoot;
  for (let i = 0; i < 24; i++) {
    const c = join(dir, '.agent-kb');
    if (existsSync(c)) return c;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function failOpen(message: string): void {
  process.stdout.write(JSON.stringify({ continue: true, user_message: message }));
}

async function main(): Promise<void> {
  const agentKb = findAgentKb(REPO_ROOT);
  if (!agentKb) {
    failOpen('Prime Gate: .agent-kb not found — use management-git sibling layout.');
    process.exit(0);
  }

  // Fast pre-flight: tsx + ws + MCP deps. Skip auto-install (slow) — surface a
  // user_message pointing to `prime_doctor install=true` if anything is fixable.
  const doctor = join(agentKb, 'anvil/prime-gate-doctor.mts');
  const tsx = join(agentKb, 'db/node_modules/tsx/dist/cli.mjs');
  if (existsSync(doctor) && existsSync(tsx)) {
    const dr = spawnSync(process.execPath, [tsx, doctor, '--json'], {
      cwd: REPO_ROOT, encoding: 'utf8', timeout: 5_000,
    });
    if (dr.status === 1) {
      failOpen(`Prime Gate doctor (fatal): ${(dr.stdout || dr.stderr).slice(0, 300)}`);
      process.exit(0);
    }
    if (dr.status === 2) {
      failOpen(`Prime Gate: secondary deps missing. Call MCP tool prime_doctor with install=true. Details: ${(dr.stdout || '').slice(0, 200)}`);
      // continue — boot may still work for resume path
    }
  }

  const hooks = await import(join(agentKb, 'anvil/lib/prime-gate-hooks.mts'));
  await hooks.drainHookStdin();

  let ws;
  try {
    ws = await hooks.loadHookWorkspace(REPO_ROOT);
  } catch (e) {
    failOpen(`Prime Gate workspace: ${(e as Error).message.slice(0, 180)}`);
    process.exit(0);
  }

  const existingSessionId = hooks.getActiveSessionId(ws.repoSlug);
  if (existingSessionId) {
    process.stdout.write(
      JSON.stringify({
        continue: true,
        env: { PRIME_SESSION_ID: existingSessionId, PRIME_REPO: ws.repoSlug },
        additional_context:
          `Prime Gate resumed session ${existingSessionId} (repo=${ws.repoSlug}). ` +
          'SSOT=CORTEX DB. Do NOT use HANDOVER.md. Session close is user-initiated only (@exit).',
      }),
    );
    process.exit(0);
  }

  const tsxCli = join(agentKb, 'db/node_modules/tsx/dist/cli.mjs');
  const boot = join(agentKb, 'anvil/prime-gate-boot.mts');

  const r = spawnSync(
    process.execPath,
    [tsxCli, boot, `--repo=${ws.repoSlug}`, '--agent=181', '--json', '--skip-cortex-boot'],
    { cwd: ws.repoRoot, encoding: 'utf8' },
  );

  if (r.status !== 0 || !r.stdout?.trim()) {
    failOpen(`Prime Gate boot failed: ${(r.stderr || r.stdout || 'unknown').slice(0, 200)}`);
    process.exit(0);
  }

  let sessionId = '';
  try {
    const raw = r.stdout.trim();
    const start = raw.indexOf('{');
    const parsed = JSON.parse(start >= 0 ? raw.slice(start) : raw);
    sessionId = parsed.sessionId ?? '';
  } catch {
    failOpen('Prime Gate boot returned invalid JSON.');
    process.exit(0);
  }

  process.stdout.write(
    JSON.stringify({
      continue: true,
      env: { PRIME_SESSION_ID: sessionId, PRIME_REPO: ws.repoSlug },
      additional_context:
        `Prime Gate boot OK. repo=${ws.repoSlug} sessionId=${sessionId}. ` +
        'SSOT=CORTEX DB (handoffs + knowledge handoff:*). ' +
        'Do NOT use HANDOVER.md. Session close is user-initiated only (@exit). Env: prime_env_* MCP. Scripts: .mts only.',
    }),
  );
  process.exit(0);
}

main().catch(err => {
  failOpen(`Prime Gate hook error: ${(err as Error).message}`);
  process.exit(0);
});
