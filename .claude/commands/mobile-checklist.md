# /mobile-checklist — Mobile Release Gate

**Model:** human-gated (W0) + claude-sonnet for config validation (W1-W5)  
**CORTEX tasks:** `task_delta_*`, `task_seat_*`, `task_mob_*`

Structured checklist for mobile release. W0 items require human action in external consoles. W1+ can be auto-validated.

---

## W0 — Ownership (ALL HUMAN-GATED)

These cannot be automated. Complete in external consoles before running W1.

- [ ] Apple Developer Program enrolled (`developer.apple.com`)
- [ ] Google Play Console account active (`play.google.com/console`)
- [ ] Stripe live-mode keys obtained (Dashboard → Developers → API keys)
- [ ] APNs certificate / key generated (Apple Developer → Certificates)
- [ ] FCM server key configured (Firebase Console → Project settings → Cloud Messaging)
- [ ] Sentry project created and DSN noted (`sentry.io`)
- [ ] EAS account linked to Apple/Google (`eas account:view`)

## W1 — Local config validation

```bash
# Validate eas.json structure
cat apps/mobile/eas.json | python3 -m json.tool > /dev/null && echo "eas.json: valid JSON"

# Check for placeholder values that must be replaced
grep -E "YOUR_|PLACEHOLDER|TODO|FIXME|xxx" apps/mobile/eas.json && echo "WARNING: placeholders found" || echo "No placeholders found"

# Validate app.config.ts exports required fields
npx tsx -e "
import cfg from './apps/mobile/app.config.ts';
const c = typeof cfg === 'function' ? cfg({}) : cfg;
const required = ['name','slug','version','ios','android'];
const missing = required.filter(k => !c.expo?.[k] && !c[k]);
if (missing.length) { console.error('Missing fields:', missing); process.exit(1); }
console.log('app.config.ts: OK');
" 2>/dev/null || echo "Check app.config.ts manually"

# Dry-run EAS iOS build
npx eas build --profile staging --platform ios --dry-run --non-interactive 2>&1 | tail -20
```

## W2 — CI Build

```bash
# Verify EAS credentials are set (not checking values, just presence)
npx eas credentials --platform ios --non-interactive 2>&1 | head -10
npx eas credentials --platform android --non-interactive 2>&1 | head -10

# Check google-services.json secret is in EAS
npx eas secret:list 2>&1 | grep -i "google\|GOOGLE" || echo "WARNING: google-services.json secret may be missing"
```

Trigger staging build:
```bash
npx eas build --profile staging --platform all --non-interactive
```

Monitor at `https://expo.dev` → your project → Builds.

## W3 — TestFlight (iOS external)

- Submit staging build to TestFlight external testing group
- Apple review: allow 1-3 business days
- Command: `npx eas submit --platform ios --profile staging`

## W4 — Play testers (Android)

- Upload staging AAB to internal/alpha track
- Command: `npx eas submit --platform android --profile staging`

## W5 — Production release

- [ ] All W0-W4 items complete
- [ ] Crash rate < 1% on staging
- [ ] PaymentSheet smoke-tested on physical device
- [ ] Push notifications confirmed on physical device

```bash
# Production build
npx eas build --profile production --platform all --non-interactive
npx eas submit --platform all --profile production
```

## Checkpoint

Update relevant `task_delta_*` and `task_seat_*` entries in `.cortex-handoff/atb-project-dashboard-kb.json` as each wave completes.
