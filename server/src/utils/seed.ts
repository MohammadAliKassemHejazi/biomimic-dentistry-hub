import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { UserRole } from '../types/enums';

/**
 * SV-05: Env-gated admin seeding.
 * Only seeds if SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD are set.
 *
 * Updated (Iter 8): if the user already exists but has the wrong role,
 * we now force-correct it to admin. This handles the case where someone
 * registered through the app first and then needs admin privileges.
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
      console.log(`[seed] Creating admin user: ${adminEmail}`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User'
      });

      console.log('[seed] ✅ Admin user created.');
    } else if (existingAdmin.role !== UserRole.ADMIN) {
      // Fix: user exists but has wrong role — promote to admin
      console.log(`[seed] User ${adminEmail} exists but has role "${existingAdmin.role}" — correcting to "admin".`);
      await existingAdmin.update({ role: UserRole.ADMIN });
      console.log('[seed] ✅ Admin role corrected.');
    } else {
      console.log(`[seed] ✅ Admin user ${adminEmail} already exists with correct role.`);
    }
  } catch (error) {
    console.error('[seed] Error seeding admin:', error);
  }
};
