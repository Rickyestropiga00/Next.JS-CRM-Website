// Script to seed initial admin user
// TODO: Implement admin user creation script
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
async function createAdminUser() {
    await dbConnect();
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
        throw new Error("ADMIN_PASSWORD is missing in .env");
    }
    const hashedPassword = await hashPassword(password);
    const admin = new User({
      name: name,
      email: email,
      password: hashedPassword,
      role: 'admin',
    });
    await admin.save();
    console.log('Admin user created');
  }
createAdminUser().then(() => {
    console.log('Seeding complete');
    process.exit(0);
}).catch((err) => {
    console.error('Error seeding admin user:', err);
    process.exit(1);
});