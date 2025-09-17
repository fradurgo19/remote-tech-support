import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export interface TicketAttributes {
  id?: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  categoryId: string;
  customerId: string;
  technicianId?: string;
  assignedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  estimatedTime?: number;
  actualTime?: number;
  tags?: string[];
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Ticket extends Model<TicketAttributes> implements TicketAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public status!: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public categoryId!: string;
  public customerId!: string;
  public technicianId!: string;
  public assignedAt!: Date;
  public resolvedAt!: Date;
  public closedAt!: Date;
  public estimatedTime!: number;
  public actualTime!: number;
  public tags!: string[];
  public metadata!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Ticket.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed', 'cancelled'),
      defaultValue: 'open',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id',
      },
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    technicianId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estimatedTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    actualTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Ticket',
  }
);

// Associations are defined in models/index.ts 