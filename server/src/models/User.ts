import bcrypt from 'bcryptjs';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserAttributes {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'technician' | 'customer';
  avatar?: string;
  phone?: string;
  company?: string;
  isActive?: boolean;
  lastLogin?: Date;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  emailVerified?: boolean;
  emailVerificationToken?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: 'admin' | 'technician' | 'customer';
  public avatar!: string;
  public phone!: string;
  public company!: string;
  public isActive!: boolean;
  public lastLogin!: Date;
  public resetPasswordToken!: string | null;
  public resetPasswordExpires!: Date | null;
  public emailVerified!: boolean;
  public emailVerificationToken!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'technician', 'customer'),
      allowNull: false,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'isActive',
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lastLogin',
    },
    resetPasswordToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'resetPasswordToken',
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'resetPasswordExpires',
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'emailVerified',
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'emailVerificationToken',
    },
  },
  {
    sequelize,
    modelName: 'User',
    // Hooks removidos: el hash se maneja en los controladores
    // para tener mejor control y evitar doble hashing
  }
);
