import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Ticket } from './Ticket';

export interface MessageAttributes {
  id?: string;
  content: string;
  ticketId: string;
  senderId: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Message extends Model<MessageAttributes> implements MessageAttributes {
  public id!: string;
  public content!: string;
  public ticketId!: string;
  public senderId!: string;
  public type!: 'text' | 'image' | 'file';
  public fileUrl!: string;
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
      type: DataTypes.ENUM('text', 'image', 'file'),
      defaultValue: 'text',
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Message',
  }
);

// Define associations
Message.belongsTo(Ticket, { foreignKey: 'ticketId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' }); 