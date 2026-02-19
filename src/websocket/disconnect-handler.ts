/**
 * Socket disconnection handler — cleans up presence, rooms, and logs the reason.
 */
import { Socket } from 'socket.io';

export interface DisconnectContext {
  userId: string;
  socketId: string;
  reason: string;
  connectedForMs: number;
}

type DisconnectHook = (ctx: DisconnectContext) => void | Promise<void>;

const hooks: DisconnectHook[] = [];

export function onSocketDisconnect(hook: DisconnectHook): void {
  hooks.push(hook);
}

export function registerDisconnectHandler(socket: Socket, userId: string): void {
  const connectedAt = Date.now();

  socket.on('disconnect', async (reason: string) => {
    const ctx: DisconnectContext = {
      userId,
      socketId: socket.id,
      reason,
      connectedForMs: Date.now() - connectedAt,
    };
    for (const hook of hooks) {
      try {
        await hook(ctx);
      } catch {
        // individual hooks must not break cleanup chain
      }
    }
  });
}
