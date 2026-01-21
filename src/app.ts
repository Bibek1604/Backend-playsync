import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";


import authRoutes from "./modules/auth/auth.routes";

import logger from "./share/utils/logger";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerOptions: swaggerJsdoc.Options = {
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
  apis: [path.join(__dirname, "modules/**/*.ts")]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const API_BASE = '/api/v1';

app.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);


app.use(`${API_BASE}/auth`, authRoutes);

app.get("/", (_req, res) => {
  res.send(
    '<h1>PlaySync API running  <a href="/swagger">Swagger Docs</a></h1>'
  );
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
