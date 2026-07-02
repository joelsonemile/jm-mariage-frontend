import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  private ensureConnected(): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io(environment.socketUrl, {
      auth: { token: localStorage.getItem('jm_token') },
      transports: ['websocket', 'polling'],
    });
    return this.socket;
  }

  joinTable(tableId: string): void {
    this.ensureConnected().emit('table:join', tableId);
  }

  leaveTable(tableId: string): void {
    this.socket?.emit('table:leave', tableId);
  }

  onSeatUpdated(callback: () => void): () => void {
    const socket = this.ensureConnected();
    socket.on('seat:updated', callback);
    return () => socket.off('seat:updated', callback);
  }

  onReservationNew(callback: () => void): () => void {
    const socket = this.ensureConnected();
    socket.on('reservation:new', callback);
    return () => socket.off('reservation:new', callback);
  }
}
