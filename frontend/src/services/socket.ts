import { io, Socket } from 'socket.io-client';
import { TrackingObject } from '../types/TrackingObject';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onObjectCreated(callback: (object: TrackingObject) => void) {
    this.socket?.on('objectCreated', callback);
  }

  onObjectUpdated(callback: (object: TrackingObject) => void) {
    this.socket?.on('objectUpdated', callback);
  }

  onObjectDeleted(callback: (id: string) => void) {
    this.socket?.on('objectDeleted', callback);
  }

  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();
