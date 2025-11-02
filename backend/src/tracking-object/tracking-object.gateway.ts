import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrackingObjectService } from './tracking-object.service';
import { CreateTrackingObjectDto } from './dto/create-tracking-object.dto';
import { UpdateTrackingObjectDto } from './dto/update-tracking-object.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TrackingObjectGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly trackingObjectService: TrackingObjectService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('getAllObjects')
  async handleGetAllObjects() {
    return await this.trackingObjectService.findAll();
  }

  @SubscribeMessage('createObject')
  async handleCreateObject(client: Socket, createDto: CreateTrackingObjectDto) {
    const object = await this.trackingObjectService.create(createDto);
    this.server.emit('objectCreated', object);
    return object;
  }

  @SubscribeMessage('updateObject')
  async handleUpdateObject(client: Socket, payload: { id: string; data: UpdateTrackingObjectDto }) {
    const object = await this.trackingObjectService.update(payload.id, payload.data);
    this.server.emit('objectUpdated', object);
    return object;
  }

  @SubscribeMessage('deleteObject')
  async handleDeleteObject(client: Socket, id: string) {
    await this.trackingObjectService.remove(id);
    this.server.emit('objectDeleted', id);
    return { success: true };
  }
}
