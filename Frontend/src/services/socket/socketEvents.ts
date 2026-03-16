export enum SocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message',
  NOTIFICATION = 'notification',
}

export type SocketPayloads = {
  [SocketEvents.MESSAGE]: {
    id: string;
    text: string;
    sender: string;
    timestamp: number;
  };
  [SocketEvents.NOTIFICATION]: {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  };
};
