import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

class Report extends Model {
  public id!: string;
  public title!: string;
  public description!: string;
  public attachments!: string[];
  public userId!: string;
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
    attachments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Report',
    tableName: 'reports',
  }
);

export default Report; 