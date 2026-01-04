import pino from "pino";
import pinoHttp from "pino-http";


export const logger = pino(
  process.env.NODE_ENV !== "production"
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
        level: "debug",
      }
    : {
        level: "info",
      }
);

export const httpLogger = pinoHttp({
  logger,
});
