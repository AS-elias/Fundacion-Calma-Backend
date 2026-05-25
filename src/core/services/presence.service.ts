import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private connectedUsers = new Set<number>();

  addUser(userId: number) {
    this.connectedUsers.add(userId);
  }

  removeUser(userId: number) {
    this.connectedUsers.delete(userId);
  }

  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  getConnectedUsers(): number[] {
    return Array.from(this.connectedUsers);
  }
}
