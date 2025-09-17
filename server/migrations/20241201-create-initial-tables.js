'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'technician', 'customer'),
        allowNull: false,
        defaultValue: 'customer'
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('online', 'away', 'busy', 'offline'),
        allowNull: false,
        defaultValue: 'offline'
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      passwordResetToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lastLoginAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      department: {
        type: Sequelize.STRING,
        allowNull: true
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'America/Bogota'
      },
      language: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'es'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Categories table
    await queryInterface.createTable('Categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '#3B82F6'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Tickets table
    await queryInterface.createTable('Tickets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'closed', 'cancelled'),
        allowNull: false,
        defaultValue: 'open'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      technicianId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      assignedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resolvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      closedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      estimatedTime: {
        type: Sequelize.INTEGER, // in minutes
        allowNull: true
      },
      actualTime: {
        type: Sequelize.INTEGER, // in minutes
        allowNull: true
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Messages table
    await queryInterface.createTable('Messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('text', 'image', 'file', 'system', 'call_start', 'call_end'),
        allowNull: false,
        defaultValue: 'text'
      },
      ticketId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      senderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      replyToId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Messages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Attachments table
    await queryInterface.createTable('Attachments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      originalName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      messageId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Messages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ticketId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      uploadedById: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create CallSessions table
    await queryInterface.createTable('CallSessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      ticketId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      initiatorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      participantIds: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: false,
        defaultValue: []
      },
      status: {
        type: Sequelize.ENUM('initiated', 'ringing', 'active', 'ended', 'missed', 'declined'),
        allowNull: false,
        defaultValue: 'initiated'
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      endedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      duration: {
        type: Sequelize.INTEGER, // in seconds
        allowNull: true
      },
      recordingUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      screenShareEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Reports table
    await queryInterface.createTable('Reports', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('technical', 'incident', 'maintenance', 'performance', 'security'),
        allowNull: false,
        defaultValue: 'technical'
      },
      status: {
        type: Sequelize.ENUM('draft', 'pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'draft'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      ticketId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      authorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      reviewedById: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Notifications table
    await queryInterface.createTable('Notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('info', 'warning', 'error', 'success', 'ticket_assigned', 'ticket_updated', 'call_incoming'),
        allowNull: false,
        defaultValue: 'info'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ticketId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create TicketHistory table for audit trail
    await queryInterface.createTable('TicketHistory', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      ticketId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.ENUM('created', 'updated', 'assigned', 'status_changed', 'priority_changed', 'resolved', 'closed', 'reopened'),
        allowNull: false
      },
      oldValue: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      newValue: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      changedById: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create indexes for better performance (with error handling)
    try {
      await queryInterface.addIndex('Users', ['email']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Users', ['role']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Users', ['status']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Tickets', ['status']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Tickets', ['priority']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Tickets', ['customerId']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Tickets', ['technicianId']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Tickets', ['categoryId']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Tickets', ['createdAt']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Messages', ['ticketId']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Messages', ['senderId']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Messages', ['createdAt']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Attachments', ['messageId']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Attachments', ['ticketId']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('CallSessions', ['ticketId']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('CallSessions', ['status']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('CallSessions', ['startedAt']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Reports', ['type']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Reports', ['status']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Reports', ['authorId']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Notifications', ['userId']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Notifications', ['isRead']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('Notifications', ['createdAt']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('TicketHistory', ['ticketId']);
    } catch (e) { /* Index already exists */ }
    
    try {
      await queryInterface.addIndex('TicketHistory', ['createdAt']);
    } catch (e) { /* Index already exists */ }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order due to foreign key constraints
    await queryInterface.dropTable('TicketHistory');
    await queryInterface.dropTable('Notifications');
    await queryInterface.dropTable('Reports');
    await queryInterface.dropTable('CallSessions');
    await queryInterface.dropTable('Attachments');
    await queryInterface.dropTable('Messages');
    await queryInterface.dropTable('Tickets');
    await queryInterface.dropTable('Categories');
    await queryInterface.dropTable('Users');
  }
};
