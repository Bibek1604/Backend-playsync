"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const logger_1 = __importDefault(require("./share/utils/logger"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "PlaySync API",
            version: "1.0.0",
            description: "API documentation for PlaySync "
        },
        servers: [
            {
                url: "http://localhost:5000/api/v1"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: [path_1.default.join(__dirname, "modules/**/*.ts")]
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
const API_BASE = '/api/v1';
app.use("/swagger", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, { explorer: true }));
app.use(`${API_BASE}/auth`, auth_routes_1.default);
app.get("/", (_req, res) => {
    res.send('<h1>PlaySync API running  <a href="/swagger">Swagger Docs</a></h1>');
});
app.use((err, _req, res, _next) => {
    logger_1.default.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});
exports.default = app;
//# sourceMappingURL=app.js.map