import { sequelize } from '../config/database';

/**
 * Idempotent schema migrations.
 *
 * Every statement uses ADD COLUMN IF NOT EXISTS / CREATE INDEX IF NOT EXISTS
 * so the entire function is safe to run on every server startup — it becomes
 * a no-op once the column or index already exists.
 *
 * WHY THIS EXISTS instead of relying on sequelize.sync({ alter: true }):
 *   - sync({ alter: true }) inspects every table and can destructively
 *     drop/recreate constraints or rename columns in production.
 *   - Raw SQL ADD COLUMN IF NOT EXISTS is O(1), fully auditable, and
 *     never touches data.
 *   - New columns are added here whenever a model gains a new field.
 *     All columns are nullable so no backfill is required.
 *
 * ADDING A NEW MIGRATION:
 *   Append a new entry to the `migrations` array below.
 *   Name it descriptively. It runs once (IF NOT EXISTS) and is silently
 *   skipped on every subsequent startup.
 */
export async function runMigrations(): Promise<void> {
  const migrations: { name: string; sql: string }[] = [

    // ── subscriptions ──────────────────────────────────────────────────────
    // SV-06 (Iter 8): PayPal subscription ID added to model but never
    // applied to the production DB because SYNC_DB=true was not set.
    {
      name: 'subscriptions__add_paypal_subscription_id',
      sql: `ALTER TABLE subscriptions
              ADD COLUMN IF NOT EXISTS paypal_subscription_id VARCHAR(255);`,
    },
    {
      name: 'subscriptions__idx_paypal_subscription_id',
      sql: `CREATE INDEX IF NOT EXISTS subscriptions_paypal_subscription_id
              ON subscriptions (paypal_subscription_id);`,
    },

    // ── subscription_plans ─────────────────────────────────────────────────
    // PayPal plan ID — added alongside PayPal checkout support.
    {
      name: 'subscription_plans__add_paypal_plan_id',
      sql: `ALTER TABLE subscription_plans
              ADD COLUMN IF NOT EXISTS paypal_plan_id VARCHAR(255);`,
    },
    // Icon key for UI rendering (e.g. 'Trophy', 'Star', 'Crown').
    {
      name: 'subscription_plans__add_icon',
      sql: `ALTER TABLE subscription_plans
              ADD COLUMN IF NOT EXISTS icon VARCHAR(255);`,
    },

    // ── partnership_requests ───────────────────────────────────────────────
    {
      name: 'partnership_requests__add_company_name',
      sql: `ALTER TABLE partnership_requests
              ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);`,
    },
    {
      name: 'partnership_requests__add_tier',
      sql: `ALTER TABLE partnership_requests
              ADD COLUMN IF NOT EXISTS tier VARCHAR(255);`,
    },
    {
      name: 'partnership_requests__add_application_file',
      sql: `ALTER TABLE partnership_requests
              ADD COLUMN IF NOT EXISTS application_file VARCHAR(255);`,
    },

    // ── ambassador_applications ────────────────────────────────────────────
    {
      name: 'ambassador_applications__add_experience',
      sql: `ALTER TABLE ambassador_applications
              ADD COLUMN IF NOT EXISTS experience TEXT;`,
    },
    {
      name: 'ambassador_applications__add_bio',
      sql: `ALTER TABLE ambassador_applications
              ADD COLUMN IF NOT EXISTS bio TEXT;`,
    },
    {
      name: 'ambassador_applications__add_social_media_links',
      sql: `ALTER TABLE ambassador_applications
              ADD COLUMN IF NOT EXISTS social_media_links TEXT;`,
    },
    {
      name: 'ambassador_applications__add_cv',
      sql: `ALTER TABLE ambassador_applications
              ADD COLUMN IF NOT EXISTS cv TEXT;`,
    },

    // ── leadership_members ─────────────────────────────────────────────────
    {
      name: 'leadership_members__add_linkedin',
      sql: `ALTER TABLE leadership_members
              ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255);`,
    },
    {
      name: 'leadership_members__add_twitter',
      sql: `ALTER TABLE leadership_members
              ADD COLUMN IF NOT EXISTS twitter VARCHAR(255);`,
    },
    {
      name: 'leadership_members__add_instagram',
      sql: `ALTER TABLE leadership_members
              ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);`,
    },
    {
      name: 'leadership_members__add_facebook',
      sql: `ALTER TABLE leadership_members
              ADD COLUMN IF NOT EXISTS facebook VARCHAR(255);`,
    },
    {
      name: 'leadership_members__add_expertise',
      sql: `ALTER TABLE leadership_members
              ADD COLUMN IF NOT EXISTS expertise VARCHAR(255);`,
    },
    {
      name: 'leadership_members__add_achievements',
      sql: `ALTER TABLE leadership_members
              ADD COLUMN IF NOT EXISTS achievements VARCHAR(255);`,
    },
    {
      name: 'leadership_members__add_status',
      sql: `ALTER TABLE leadership_members
              ADD COLUMN IF NOT EXISTS status VARCHAR(255);`,
    },

    // ── trusted_partners ───────────────────────────────────────────────────
    {
      name: 'trusted_partners__add_tier',
      sql: `ALTER TABLE trusted_partners
              ADD COLUMN IF NOT EXISTS tier VARCHAR(255);`,
    },
    {
      name: 'trusted_partners__add_website',
      sql: `ALTER TABLE trusted_partners
              ADD COLUMN IF NOT EXISTS website VARCHAR(255);`,
    },

    // ── blog_posts ─────────────────────────────────────────────────────────
    // TEXT[] array column for multi-image support.
    {
      name: 'blog_posts__add_images',
      sql: `ALTER TABLE blog_posts
              ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';`,
    },
  ];

  console.log(`[migrate] Running ${migrations.length} idempotent migrations…`);
  let applied = 0;
  let skipped = 0;

  for (const migration of migrations) {
    try {
      await sequelize.query(migration.sql);
      applied++;
    } catch (err: any) {
      // In practice this branch should never fire because every statement
      // uses IF NOT EXISTS. Log and continue — never crash startup.
      console.error(`[migrate] WARN ${migration.name}: ${err?.message}`);
      skipped++;
    }
  }

  console.log(`[migrate] Done — ${applied} applied, ${skipped} warned.`);
}
