"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
        minlength: [2, "Full name must be at least 2 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    refreshTokens: {
        type: [String],
        default: [],
        select: false,
    },
    lastLogin: Date,
    passwordChangedAt: Date,
    failedLoginAttempts: {
        type: Number,
        default: 0,
        select: false,
    },
    lockUntil: {
        type: Date,
        select: false,
    },
    phone: {
        type: String,
        trim: true,
        default: "",
    },
    favoriteGame: {
        type: String,
        trim: true,
        default: "",
    },
    place: {
        type: String,
        trim: true,
        default: "",
    },
    profilePicture: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
});
userSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    try {
        this.password = await bcryptjs_1.default.hash(this.password, 12);
        this.passwordChangedAt = new Date(Date.now() - 1000);
    }
    catch (error) {
        throw error;
    }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
userSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > new Date());
};
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt((this.passwordChangedAt.getTime() / 1000).toString(), 10);
        return jwtTimestamp < changedTimestamp;
    }
    return false;
};
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};
exports.User = mongoose_1.default.model("User", userSchema);
//# sourceMappingURL=auth.model.js.map