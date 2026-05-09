import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server!: Server;

  // liste des connectés : socketId → nom
  private connectedUsers: Map<string, string> = new Map();

  constructor(private readonly messagesService: MessagesService) {}

  // déclenché automatiquement quand un client se connecte
  handleConnection(client: Socket) {
    console.log(`Client connecté : ${client.id}`);
  }

  // déclenché automatiquement quand un client se déconnecte
  handleDisconnect(client: Socket) {
    const username = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);

    // prévient tout le monde qu'un utilisateur est parti
    this.server.emit('userLeft', {
      username,
      connectedUsers: Array.from(this.connectedUsers.values()),
    });

    console.log(`Client déconnecté : ${client.id}`);
  }

  // événement : un utilisateur rejoint le chat avec son nom
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() username: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedUsers.set(client.id, username);

    // envoie à CE client tous les messages existants
    client.emit('previousMessages', this.messagesService.getMessages());

    // prévient TOUT LE MONDE qu'un nouvel utilisateur a rejoint
    this.server.emit('userJoined', {
      username,
      connectedUsers: Array.from(this.connectedUsers.values()),
    });
  }

  // événement : un utilisateur envoie un message
  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = this.messagesService.addMessage(dto.content, dto.author);

    // envoie le message à TOUT LE MONDE (y compris l'expéditeur)
    this.server.emit('newMessage', message);
  }

  // événement : un utilisateur réagit à un message avec un emoji
  @SubscribeMessage('react')
  handleReaction(
    @MessageBody() data: { messageId: string; emoji: string; author: string },
    @ConnectedSocket() client: Socket,
  ) {
    const updatedMessage = this.messagesService.addReaction(
      data.messageId,
      data.emoji,
      data.author,
    );

    if (updatedMessage) {
      // envoie le message mis à jour à tout le monde
      this.server.emit('messageUpdated', updatedMessage);
    }
  }

  // événement : un utilisateur est en train de taper
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() username: string,
    @ConnectedSocket() client: Socket,
  ) {
    // prévient tout le monde SAUF l'expéditeur
    client.broadcast.emit('userTyping', { username });
  }

  // événement : un utilisateur a arrêté de taper
  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() username: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('userStoppedTyping', { username });
  }
}