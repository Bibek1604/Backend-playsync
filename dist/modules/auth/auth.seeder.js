"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = void 0;
const auth_model_1 = require("./auth.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = __importDefault(require("../../Share/utils/logger"));
const seedAdmin = async () => {
    try {
        const adminEmail = "admin@playsync.com";
        const existingAdmin = await auth_model_1.User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const hashedPassword = await bcryptjs_1.default.hash("admin123", 12);
            await auth_model_1.User.create({
                fullName: "Super Admin",
                email: adminEmail,
                password: "admin123",
                role: "admin",
                isVerified: true
            });
            logger_1.default.info("Admin user seeded successfully");
        }
        else {
            logger_1.default.info("Admin user already exists");
        }
    }
    catch (error) {
        logger_1.default.error({ err: error }, "Error seeding admin user");
    }
};
exports.seedAdmin = seedAdmin;
//# sourceMappingURL=auth.seeder.js.map