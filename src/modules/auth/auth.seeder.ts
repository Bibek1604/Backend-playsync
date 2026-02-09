
import { User } from "./auth.model";
import bcrypt from "bcryptjs";
import logger from "../../Share/utils/logger";

export const seedAdmin = async () => {
    try {
        const adminEmail = "admin@playsync.com";
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("admin123", 12);

            await User.create({
                fullName: "Super Admin",
                email: adminEmail,
                password: "admin123", // The model pre-save hook might auto-hash this if we didn't hash it here, but let's see. 
                // Actually, looking at auth.model.ts, the pre-save hook hashes the password if modified.
                // So we should pass the plaintext password if we want the hook to handle it, OR hash it and set the field manually.
                // However, if we pass plaintext, the pre-save hook will hash it.
                // Let's pass plaintext to be consistent with the model's behavior.
                // password: "admin123", 
                role: "admin",
                isVerified: true
            });
            logger.info("Admin user seeded successfully");
        } else {
            logger.info("Admin user already exists");
        }
    } catch (error) {
        logger.error({ err: error }, "Error seeding admin user");
    }
};
