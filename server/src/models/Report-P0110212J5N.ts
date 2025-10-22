import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export interface ReportAttributes {
  id?: string;
  title: string;
  description: string;
  type: 'technical' | 'incident' | 'maintenance' | 'performance' | 'security';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  authorId: string;
  customerId: string;
  reviewedById?: string;
  ticketId?: string;
  reviewedAt?: Date;
  tags?: string[];
  attachments?: string[];
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Report
  extends Model<ReportAttributes>
  implements ReportAttributes
{
  public id!: string;
  public title!: string;
  public description!: string;
  public type!:
    | 'technical'
    | 'incident'
    | 'maintenance'
    | 'performance'
    | 'security';
  public status!: 'draft' | 'pending' | 'approved' | 'rejected';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public authorId!: string;
  public customerId!: string;
  public reviewedById!: string;
  public ticketId!: string;
  public reviewedAt!: Date;
  public tags!: string[];
  public attachments!: string[];
  public metadata!: Record<string, unknown>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Report.init(
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
    type: {
      type: DataTypes.ENUM(
        'technical',
        'incident',
        'maintenance',
        'performance',
        'security'
      ),
      allowNull: false,
      defaultValue: 'technical',
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected'),
      defaultValue: 'draft',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
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
    reviewedById: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Tickets',
        key: 'id',
      },
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    attachments: {
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
    modelName: 'Report',
  }
);
