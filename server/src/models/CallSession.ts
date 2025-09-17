import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Ticket } from './Ticket';

export interface CallSessionAttributes {
  id?: string;
  ticketId: string;
  initiatorId: string;
  participantIds: string[];
  status: 'initiated' | 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  recordingUrl?: string;
  screenShareEnabled?: boolean;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CallSession extends Model<CallSessionAttributes> implements CallSessionAttributes {
  public id!: string;
  public ticketId!: string;
  public initiatorId!: string;
  public participantIds!: string[];
  public status!: 'initiated' | 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
  public startedAt!: Date;
  public endedAt!: Date;
  public duration!: number;
  public recordingUrl!: string;
  public screenShareEnabled!: boolean;
  public metadata!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CallSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Ticket,
        key: 'id',
      },
    },
    initiatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    participantIds: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('initiated', 'ringing', 'active', 'ended', 'missed', 'declined'),
      allowNull: false,
      defaultValue: 'initiated',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    recordingUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    screenShareEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'CallSession',
  }
);

// Associations are defined in models/index.ts
