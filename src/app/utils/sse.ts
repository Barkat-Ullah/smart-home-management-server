import { Response } from 'express';

const clients = new Map<string, Response>();

export const addSSEClient = (userId: string, res: Response) => {
  clients.set(userId, res);
};

export const removeSSEClient = (userId: string) => {
  clients.delete(userId);
};

export const sendSSEToUser = (userId: string, event: string, data: any) => {
  const client = clients.get(userId);
  if (client) {
    client.write(`event: ${event}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};

export const sendSSEToUsers = (userIds: string[], event: string, data: any) => {
  userIds.forEach(userId => sendSSEToUser(userId, event, data));
};
