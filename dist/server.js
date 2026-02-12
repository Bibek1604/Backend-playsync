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
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./Share/config/db"));
const logger_1 = __importDefault(require("./Share/utils/logger"));
const game_cleanup_job_1 = __importDefault(require("./jobs/game.cleanup.job"));
const socket_server_1 = require("./websocket/socket.server");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
(async () => {
    try {
        await (0, db_1.default)();
        const { seedAdmin } = await Promise.resolve().then(() => __importStar(require("./modules/auth/auth.seeder")));
        await seedAdmin();
        const server = http_1.default.createServer(app_1.default);
        (0, socket_server_1.initializeSocketServer)(server);
        logger_1.default.info('✅ WebSocket server initialized');
        const { initializeGameService } = await Promise.resolve().then(() => __importStar(require('./modules/game/game.service.factory')));
        const gameEventsEmitter = (0, socket_server_1.getGameEventsEmitter)();
        initializeGameService(gameEventsEmitter);
        logger_1.default.info('✅ Game service initialized with real-time events');
        game_cleanup_job_1.default.start();
        server.listen(PORT, () => {
            logger_1.default.info(`Server running at http://localhost:${PORT}/swagger`);
            logger_1.default.info(`WebSocket server ready for connections`);
        });
    }
    catch (err) {
        logger_1.default.error("Startup error");
        console.error(err);
        process.exit(1);
    }
})();
//# sourceMappingURL=server.js.map