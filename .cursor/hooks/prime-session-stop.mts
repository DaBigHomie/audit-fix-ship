#!/usr/bin/env npx tsx
/**
 * Prime Gate — Cursor stop hook (.mts only).
 *
 * Intentionally emits {} — never followup_message.
 * Auto followups caused infinite loops (close reminder + PR review) across workspaces.
 * Session close: @exit / prime_close. PR review: @exit or explicit Task subagent.
 */
process.stdout.write('{}');
process.exit(0);
