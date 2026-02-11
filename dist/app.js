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
const game_routes_1 = __importDefault(require("./modules/game/game.routes"));
const logger_1 = __importDefault(require("./Share/utils/logger"));
const app = (0, express_1.default)();
const corsOptions = {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
};
app.options("*", (0, cors_1.default)(corsOptions));
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "PlaySync API",
            version: "1.0.0",
            description: "API documentation for PlaySync - Gaming Platform Backend"
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Local development server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter JWT token obtained from login (without 'Bearer' prefix)"
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: [
        path_1.default.join(__dirname, "modules/**/*.ts"),
        path_1.default.join(__dirname, "modules/**/*.swagger.ts")
    ]
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
const API_BASE = '/api/v1';
app.use("/swagger", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, { explorer: true }));
app.use(`${API_BASE}/auth`, auth_routes_1.default);
app.use(`${API_BASE}/games`, game_routes_1.default);
app.get("/", (_req, res) => {
    res.send('<h1>PlaySync API running  <a href="/swagger">Swagger Docs</a></h1>');
});
app.use((err, _req, res, _next) => {
    logger_1.default.error(err.stack);
    if (err.statusCode) {
        const response = {
            message: err.message,
            errorCode: err.errorCode || 'INTERNAL_ERROR'
        };
        if (err.data) {
            response.data = err.data;
        }
        res.status(err.statusCode).json(response);
    }
    else {
        res.status(500).json({ message: "Internal Server Error", errorCode: 'INTERNAL_ERROR' });
    }
});
exports.default = app;
//# sourceMappingURL=app.js.map