"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const register = async (req, res) => {
    try {
        const result = await (0, auth_service_1.registerUser)(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const result = await (0, auth_service_1.loginUser)(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
};
exports.login = login;
//# sourceMappingURL=auth.controller.js.map