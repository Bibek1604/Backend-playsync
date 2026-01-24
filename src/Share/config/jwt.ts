import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "playsync_secret";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export const signAccessToken = (payload: object) => {
  return (jwt.sign as any)(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
};

export const signRefreshToken = (payload: object) => {
  return (jwt.sign as any)(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
