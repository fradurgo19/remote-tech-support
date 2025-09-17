import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Ticket } from './Ticket';

export interface MessageAttributes {
  id?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system' | 'call_start' | 'call_end';
  ticketId: string;
  senderId: string;
  replyToId?: string;
  isRead?: boolean;
  readAt?: Date;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Message extends Model<MessageAttributes> implements MessageAttributes {
  public id!: string;
  public content!: string;
  public type!: 'text' | 'image' | 'file' | 'system' | 'call_start' | 'call_end';
  public ticketId!: string;
  public senderId!: string;
  public replyToId!: string;
  public isRead!: boolean;
  public readAt!: Date;
  public metadata!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Ticket,
        key: 'id',
      },
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('text', 'image', 'file', 'system', 'call_start', 'call_end'),
      defaultValue: 'text',
    },
    replyToId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Messages',
        key: 'id',
      },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Message',
  }
);

// Associations are defined in models/index.ts 