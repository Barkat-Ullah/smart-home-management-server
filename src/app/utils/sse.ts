import { Response } from 'express';

const clients = new Map<string, Set<Response>>();

export const addSSEClient = (userId: string, res: Response) => {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(res);
};

export const removeSSEClient = (userId: string, res: Response) => {
  clients.get(userId)?.delete(res);
  if (clients.get(userId)?.size === 0) clients.delete(userId);
};

export const sendSSEToUser = (userId: string, event: string, data: any) => {
  clients.get(userId)?.forEach(res => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

const startGlobalHeartbeat = () => {
  setInterval(() => {
    let activeCount = 0;
    const toRemove: { userId: string; res: Response }[] = [];

    clients.forEach((connections, userId) => {
      connections.forEach(res => {
        try {
          res.write(`: ping\n\n`);
          activeCount++;
        } catch {
          toRemove.push({ userId, res });
        }
      });
    });

    // Remove dead connections after iteration to avoid Set mutation bugs
    toRemove.forEach(({ userId, res }) => {
      removeSSEClient(userId, res);
    });

    if (activeCount > 0) {
      console.log(`Heartbeat: ${activeCount} active SSE connections`);
    }
  }, 20000);
};

startGlobalHeartbeat();
