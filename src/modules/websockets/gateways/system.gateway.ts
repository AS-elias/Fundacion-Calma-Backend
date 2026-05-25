import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SystemGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SystemGateway');

  afterInit(server: Server) {
    this.logger.log('SystemGateway Initialized for global events');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected to system gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from system gateway: ${client.id}`);
  }

  emitSistemaActualizado(modulo: string, accion: string) {
    this.logger.log(
      `Emitting sistema_actualizado -> modulo: ${modulo}, accion: ${accion}`,
    );
    this.server.emit('sistema_actualizado', { modulo, accion });
  }
}
