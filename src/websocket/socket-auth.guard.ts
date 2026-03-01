import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { TokenRevocationStore } from '../modules/auth/token-revocation.store';

export interface SocketUser {
  id: string;
  email: string;
  name: string;
}

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser;
  }
}

export async function socketAuthGuard(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    const token =
      socket.handshake.auth?.token ??
      (socket.handshake.headers['authorization'] as string)?.replace('Bearer ', '');

    if (!token) {
      next(new Error('Authentication token missing.'));
      return;
    }

    const secret = process.env.JWT_SECRET ?? '';
    const decoded = jwt.verify(token, secret) as SocketUser & { jti?: string };

    if (decoded.jti && TokenRevocationStore.isRevoked(decoded.jti)) {
      next(new Error('Token has been revoked.'));
      return;
    }

    socket.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch {
    next(new Error('Invalid or expired token.'));
  }
}
