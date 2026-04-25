# Report Registry

iteration: 4
status: in_progress
started: 2026-04-25T00:00:00Z
scope: Partnership auto-approval + TrustedPartner creation, Admin stale data fix, Course/Resource system, Ambassador apply error, Blog image rendering, Mobile PWA, 3D GPU optimization

## Agent Status
- frontend-expert: pending
- backend-expert: pending
- architect: pending
- qa-tester: pending

## Current Phase
INVESTIGATE

## Archive
- iter-1: .claude/reports/archive/iter-1/reports-iter-1.zip
- iter-2: .claude/reports/archive/iter-2/reports-iter-2.zip
- iter-3: .claude/reports/archive/iter-3/reports-iter-3.zip

## Deferred from Iteration 3 (all are Iter 4 candidates)
- SV-06: Sequelize-cli/umzug migrations (paypalSubscriptionId column + composite index)
- FE-03-full: HttpOnly cookie + CSRF coordinated migration
- U-M1: HeroSection LCP refactor (needs product sign-off)
- Cleanup: Remove @types/stripe devDependency
- getFavorites: view_count scalar subquery (same fix as SV-20)
- SV-14 scope: clearUserCache in admin role-change endpoints

## New scope added by user (Iteration 4)
- PA-01: Partnership auto-approval — auto-create TrustedPartner on approve, admin chooses tier
- PA-02: Admin dashboard stale data — clearCache in trustedPartner controller + admin refetch fix
- CR-01: Course creation system — admin form + course detail pages
- CR-02: Resource creation system — admin form + resource detail pages
- FE-04: Ambassador apply page router.push error (verify/reapply useEffect fix)
- FE-05: Blog post embedded images not appearing
- FE-06: Mobile-friendly + PWA (install prompt, manifest, responsive)
- FE-07: 3D GPU optimization (BiomimeticTooth3D)

## Active conflicts
None yet
