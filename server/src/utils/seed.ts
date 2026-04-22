import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { UserRole } from '../types/enums';

/**
 * SV-05: Env-gated admin seeding.
 * Previously this file seeded `admin@admin.com / 1234554321` on every boot — including production.
 * Now we only seed if BOTH `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are set, and we
 * enforce a minimum password length so a trivial credential doesn't slip into prod by mistake.
 */
export const seedDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('[seed] SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin seed.');
      return;
    }

    if (adminPassword.length < 12) {
      console.warn('[seed] SEED_ADMIN_PASSWORD is shorter than 12 chars — refusing to seed.');
      return;
    }

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      console.log(`[seed] Seeding admin user: ${adminEmail}`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User'
      });

      console.log('[seed] Admin user created.');
    } else {
      console.log('[seed] Admin user already exists — skipping.');
    }
  } catch (error) {
    console.error('[seed] Error seeding admin:', error);
  }
};
