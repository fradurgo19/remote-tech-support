import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export interface TicketAttributes {
  id?: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  customerId: string;
  technicianId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Ticket extends Model<TicketAttributes> implements TicketAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public status!: 'open' | 'in_progress' | 'resolved' | 'closed';
  public priority!: 'low' | 'medium' | 'high';
  public category!: string;
  public customerId!: string;
  public technicianId!: string;
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
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
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
  },
  {
    sequelize,
    modelName: 'Ticket',
  }
);

// Define associations
Ticket.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
Ticket.belongsTo(User, { as: 'technician', foreignKey: 'technicianId' }); 