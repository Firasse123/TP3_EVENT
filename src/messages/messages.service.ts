import { Injectable } from '@nestjs/common';

export interface Message {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  reactions: { emoji: string; author: string }[];
}

@Injectable()
export class MessagesService {
  // stockage en mémoire (pas de base de données pour le chat)
  private messages: Message[] = [];

  // ajoute un message et le retourne
  addMessage(content: string, author: string): Message {
    const message: Message = {
      id: Date.now().toString(),
      content,
      author,
      timestamp: new Date(),
      reactions: [],
    };
    this.messages.push(message);
    return message;
  }

  // retourne tous les messages
  getMessages(): Message[] {
    return this.messages;
  }

  // ajoute une réaction emoji à un message
  addReaction(messageId: string, emoji: string, author: string): Message | null {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message) return null;

    message.reactions.push({ emoji, author });
    return message;
  }
}