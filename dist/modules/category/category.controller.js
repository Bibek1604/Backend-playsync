"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = exports.create = void 0;
const category_service_1 = require("./category.service");
const create = async (req, res) => {
    try {
        const category = await (0, category_service_1.createCategory)(req.body.name);
        res.status(201).json(category);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.create = create;
const getAll = async (_req, res) => {
    const categories = await (0, category_service_1.getAllCategories)();
    res.json(categories);
};
exports.getAll = getAll;
//# sourceMappingURL=category.controller.js.map