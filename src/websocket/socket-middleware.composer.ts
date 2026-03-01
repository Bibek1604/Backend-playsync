import { Server, Socket } from 'socket.io';

export interface SocketMiddlewareFn {
  (socket: Socket, next: (err?: Error) => void): void;
}

/**
 * Composes multiple Socket.IO middleware functions into a single pipeline.
 * Applied in order — if any throws or calls next(err), the chain halts.
 */
export function composeSocketMiddleware(...middlewares: SocketMiddlewareFn[]): SocketMiddlewareFn {
  return (socket, next) => {
    const run = (index: number) => {
      if (index >= middlewares.length) {
        next();
        return;
      }
      middlewares[index](socket, (err) => {
        if (err) {
          next(err);
          return;
        }
        run(index + 1);
      });
    };
    run(0);
  };
}

/**
 * Applies middlewares to every socket on a namespace/server.
 */
export function applySocketMiddlewares(io: Server, ...middlewares: SocketMiddlewareFn[]): void {
  const composed = composeSocketMiddleware(...middlewares);
  io.use(composed);
}
