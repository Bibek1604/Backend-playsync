import { Socket } from 'socket.io';

const isDev = process.env.NODE_ENV !== 'production';

const ANSI = {
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  reset: '\x1b[0m',
  dim: '\x1b[2m',
};

export class SocketEventLogger {
  static attachToSocket(socket: Socket): void {
    if (!isDev) return;

    const userId = (socket as any).user?.id ?? 'unauthenticated';
    const prefix = `${ANSI.cyan}[WS]${ANSI.reset}`;

    console.log(`${prefix} ${ANSI.green}CONNECTED${ANSI.reset} socketId=${socket.id} userId=${userId}`);

    socket.onAny((event: string, ...args: unknown[]) => {
      const payload = JSON.stringify(args[0] ?? {}).slice(0, 120);
      console.log(`${prefix} ${ANSI.yellow}↑${ANSI.reset} ${event} ${ANSI.dim}${payload}${ANSI.reset}`);
    });

    socket.onAnyOutgoing((event: string, ...args: unknown[]) => {
      const payload = JSON.stringify(args[0] ?? {}).slice(0, 120);
      console.log(`${prefix} ${ANSI.cyan}↓${ANSI.reset} ${event} ${ANSI.dim}${payload}${ANSI.reset}`);
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`${prefix} ${ANSI.red}DISCONNECTED${ANSI.reset} socketId=${socket.id} reason=${reason}`);
    });

    socket.on('error', (err: Error) => {
      console.error(`${prefix} ${ANSI.red}ERROR${ANSI.reset} socketId=${socket.id}`, err.message);
    });
  }
}
