"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./share/config/db"));
const logger_1 = __importDefault(require("./share/utils/logger"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
(async () => {
    try {
        await (0, db_1.default)();
        const server = http_1.default.createServer(app_1.default);
        server.listen(PORT, () => {
            logger_1.default.info(`Server running at http://localhost:${PORT}/swagger`);
        });
    }
    catch (err) {
        logger_1.default.error("Startup error");
        console.error(err);
        process.exit(1);
    }
})();
//# sourceMappingURL=server.js.map