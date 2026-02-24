import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { UserRole } from '../types/enums';

export const seedDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@admin.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      console.log('Seeding default admin user...');
      const hashedPassword = await bcrypt.hash('1234554321', 10);

      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User'
      });

      console.log('Default admin user created successfully.');
    } else {
      console.log('Default admin user already exists.');
    }
  } catch (error) {
    console.error('Error seeding default admin:', error);
  }
};
