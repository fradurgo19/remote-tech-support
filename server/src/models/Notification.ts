import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Ticket } from './Ticket';

export interface NotificationAttributes {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'ticket_assigned' | 'ticket_updated' | 'call_incoming';
  userId: string;
  ticketId?: string;
  isRead?: boolean;
  readAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
  public id!: string;
  public title!: string;
  public message!: string;
  public type!: 'info' | 'warning' | 'error' | 'success' | 'ticket_assigned' | 'ticket_updated' | 'call_incoming';
  public userId!: string;
  public ticketId!: string;
  public isRead!: boolean;
  public readAt!: Date;
  public metadata!: Record<string, unknown>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('info', 'warning', 'error', 'success', 'ticket_assigned', 'ticket_updated', 'call_incoming'),
      allowNull: false,
      defaultValue: 'info',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Ticket,
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
    modelName: 'Notification',
  }
);

// Associations are defined in models/index.ts
