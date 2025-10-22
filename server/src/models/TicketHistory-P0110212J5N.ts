import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Ticket } from './Ticket';

export interface TicketHistoryAttributes {
  id?: string;
  ticketId: string;
  action: 'created' | 'updated' | 'assigned' | 'status_changed' | 'priority_changed' | 'resolved' | 'closed' | 'reopened';
  oldValue?: string;
  newValue?: string;
  changedById: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export class TicketHistory extends Model<TicketHistoryAttributes> implements TicketHistoryAttributes {
  public id!: string;
  public ticketId!: string;
  public action!: 'created' | 'updated' | 'assigned' | 'status_changed' | 'priority_changed' | 'resolved' | 'closed' | 'reopened';
  public oldValue!: string;
  public newValue!: string;
  public changedById!: string;
  public metadata!: Record<string, unknown>;
  public readonly createdAt!: Date;
}

TicketHistory.init(
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
    action: {
      type: DataTypes.ENUM('created', 'updated', 'assigned', 'status_changed', 'priority_changed', 'resolved', 'closed', 'reopened'),
      allowNull: false,
    },
    oldValue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    newValue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    changedById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'TicketHistory',
    timestamps: true,
    createdAt: true,
    updatedAt: false,
  }
);

// Associations are defined in models/index.ts
