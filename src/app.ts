import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";


import authRoutes from "./modules/auth/auth.routes";
import profileRoutes from "./modules/profile/profile.routes";

import logger from "./Share/utils/logger";
const app = express();

// CORS configuration - Allow all origins for development
const corsOptions: cors.CorsOptions = {
  origin: true, // Reflects the request origin, allowing all origins with credentials
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: true, // Allow cookies and authorization headers
  optionsSuccessStatus: 200, // For legacy browser support
  preflightContinue: false,
};

// Handle preflight requests
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
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
app.use(`${API_BASE}/profile`, profileRoutes);

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
