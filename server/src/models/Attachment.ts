import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Message } from './Message';
import { Ticket } from './Ticket';

export interface AttachmentAttributes {
  id?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string;
  messageId?: string;
  ticketId?: string;
  uploadedById: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Attachment extends Model<AttachmentAttributes> implements AttachmentAttributes {
  public id!: string;
  public filename!: string;
  public originalName!: string;
  public mimeType!: string;
  public size!: number;
  public path!: string;
  public url!: string;
  public messageId!: string;
  public ticketId!: string;
  public uploadedById!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attachment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Message,
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
    uploadedById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Attachment',
  }
);

// Associations are defined in models/index.ts
