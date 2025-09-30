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
  status: 'online' | 'away' | 'busy' | 'offline';
  emailVerified?: boolean;
  passwordResetToken?: string | null;
  lastLoginAt?: Date;
  phone?: string;
  department?: string;
  timezone?: string;
  language?: string;
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
  public status!: 'online' | 'away' | 'busy' | 'offline';
  public emailVerified!: boolean;
  public passwordResetToken!: string | null;
  public lastLoginAt!: Date;
  public phone!: string;
  public department!: string;
  public timezone!: string;
  public language!: string;
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
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('online', 'away', 'busy', 'offline'),
      defaultValue: 'offline',
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'America/Bogota',
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'es',
    },
  },
  {
    sequelize,
    modelName: 'User',
    // Hooks removidos: el hash se maneja en los controladores
    // para tener mejor control y evitar doble hashing
  }
);
