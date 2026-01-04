"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = exports.createCategory = void 0;
const category_model_1 = __importDefault(require("./category.model"));
const createCategory = async (name) => {
    return await category_model_1.default.create({ name });
};
exports.createCategory = createCategory;
const getAllCategories = async () => {
    return await category_model_1.default.find();
};
exports.getAllCategories = getAllCategories;
//# sourceMappingURL=category.service.js.map