"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../auth/user.model"));
const jwt_1 = require("../../config/jwt");
const registerUser = async (data) => {
    const existingUser = await user_model_1.default.findOne({ email: data.email });
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
    const user = await user_model_1.default.create({
        username: data.username,
        email: data.email,
        password: hashedPassword
    });
    const token = (0, jwt_1.signToken)({ id: user._id, role: user.role });
    return {
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },
        token
    };
};
exports.registerUser = registerUser;
const loginUser = async (data) => {
    const user = await user_model_1.default.findOne({ email: data.email });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const isMatch = await bcryptjs_1.default.compare(data.password, user.password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }
    const token = (0, jwt_1.signToken)({ id: user._id, role: user.role });
    return {
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },
        token
    };
};
exports.loginUser = loginUser;
//# sourceMappingURL=auth.service.js.map