'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create default categories
    const categories = await queryInterface.bulkInsert('Categories', [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Soporte Remoto',
        description: 'Asistencia técnica remota para resolver problemas de software, hardware y conectividad',
        icon: 'headset',
        color: '#3B82F6',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Hardware',
        description: 'Problemas relacionados con equipos físicos, periféricos y componentes',
        icon: 'monitor',
        color: '#10B981',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Software',
        description: 'Problemas con aplicaciones, sistemas operativos y programas',
        icon: 'code',
        color: '#8B5CF6',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Red y Conectividad',
        description: 'Problemas de red, internet, VPN y conectividad',
        icon: 'wifi',
        color: '#F59E0B',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Seguridad',
        description: 'Problemas de seguridad, antivirus y acceso',
        icon: 'shield',
        color: '#EF4444',
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'Email y Comunicación',
        description: 'Problemas con correo electrónico y herramientas de comunicación',
        icon: 'mail',
        color: '#06B6D4',
        isActive: true,
        sortOrder: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Create default users
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const users = await queryInterface.bulkInsert('Users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Administrador del Sistema',
        email: 'admin@partequipos.com',
        password: hashedPassword,
        role: 'admin',
        avatar: 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590236/Admin_sublte.png',
        status: 'online',
        emailVerified: true,
        phone: '+57 300 123 4567',
        department: 'Tecnología',
        timezone: 'America/Bogota',
        language: 'es',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        name: 'Juan Técnico',
        email: 'auxiliar.garantiasbg@partequipos.com',
        password: hashedPassword,
        role: 'technician',
        avatar: 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590236/Soporte_hcfjxa.png',
        status: 'online',
        emailVerified: true,
        phone: '+57 300 234 5678',
        department: 'Soporte Técnico',
        timezone: 'America/Bogota',
        language: 'es',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        name: 'Soporte al Producto',
        email: 'analista.mantenimiento@partequipos.com',
        password: hashedPassword,
        role: 'technician',
        avatar: 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590236/Soporte_hcfjxa.png',
        status: 'away',
        emailVerified: true,
        phone: '+57 300 345 6789',
        department: 'Mantenimiento',
        timezone: 'America/Bogota',
        language: 'es',
        lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        name: 'Miguel Usuario',
        email: 'miguel@empresa.com',
        password: hashedPassword,
        role: 'customer',
        avatar: 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590235/Cliente_kgzuwh.jpg',
        status: 'offline',
        emailVerified: true,
        phone: '+57 300 456 7890',
        department: 'Ventas',
        timezone: 'America/Bogota',
        language: 'es',
        lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        name: 'Ana García',
        email: 'ana.garcia@empresa.com',
        password: hashedPassword,
        role: 'customer',
        avatar: 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590235/Cliente_kgzuwh.jpg',
        status: 'offline',
        emailVerified: true,
        phone: '+57 300 567 8901',
        department: 'Recursos Humanos',
        timezone: 'America/Bogota',
        language: 'es',
        lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Create sample tickets
    const tickets = await queryInterface.bulkInsert('Tickets', [
      {
        id: '550e8400-e29b-41d4-a716-446655440020',
        title: 'No puedo conectarme a la VPN',
        description: 'No puedo conectarme a la VPN de la empresa desde mi oficina en casa. El error que aparece es "Connection timeout".',
        status: 'open',
        priority: 'high',
        categoryId: '550e8400-e29b-41d4-a716-446655440004', // Red y Conectividad
        customerId: '550e8400-e29b-41d4-a716-446655440013', // Miguel Usuario
        technicianId: null,
        assignedAt: null,
        resolvedAt: null,
        closedAt: null,
        estimatedTime: 30,
        actualTime: null,
        tags: ['vpn', 'conexión', 'home-office'],
        metadata: JSON.stringify({
          device: 'Windows 10',
          browser: 'Chrome',
          location: 'Bogotá, Colombia'
        }),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440021',
        title: 'Outlook se cierra al iniciar',
        description: 'Mi aplicación de Outlook se cierra inmediatamente después de abrirse. He intentado reiniciar el equipo pero el problema persiste.',
        status: 'in_progress',
        priority: 'medium',
        categoryId: '550e8400-e29b-41d4-a716-446655440006', // Email y Comunicación
        customerId: '550e8400-e29b-41d4-a716-446655440014', // Ana García
        technicianId: '550e8400-e29b-41d4-a716-446655440011', // Juan Técnico
        assignedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        resolvedAt: null,
        closedAt: null,
        estimatedTime: 45,
        actualTime: 20,
        tags: ['outlook', 'cierre', 'aplicación'],
        metadata: JSON.stringify({
          device: 'Windows 11',
          officeVersion: 'Microsoft 365',
          location: 'Medellín, Colombia'
        }),
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        updatedAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440022',
        title: 'Problema con impresora de red',
        description: 'La impresora HP LaserJet no responde cuando intento imprimir documentos. Otros usuarios también reportan el mismo problema.',
        status: 'resolved',
        priority: 'medium',
        categoryId: '550e8400-e29b-41d4-a716-446655440002', // Hardware
        customerId: '550e8400-e29b-41d4-a716-446655440013', // Miguel Usuario
        technicianId: '550e8400-e29b-41d4-a716-446655440012', // Soporte al Producto
        assignedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        closedAt: null,
        estimatedTime: 60,
        actualTime: 45,
        tags: ['impresora', 'red', 'hp'],
        metadata: JSON.stringify({
          device: 'HP LaserJet Pro M404n',
          ip: '192.168.1.100',
          location: 'Oficina Principal'
        }),
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ], { returning: true });

    // Create sample messages
    await queryInterface.bulkInsert('Messages', [
      {
        id: '550e8400-e29b-41d4-a716-446655440030',
        content: 'Hola, necesito ayuda con mi conexión VPN.',
        type: 'text',
        ticketId: '550e8400-e29b-41d4-a716-446655440020',
        senderId: '550e8400-e29b-41d4-a716-446655440013', // Miguel Usuario
        replyToId: null,
        isRead: false,
        readAt: null,
        metadata: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440031',
        content: 'Hola Miguel, te ayudaré a solucionar tu problema de VPN. ¿Puedes decirme qué mensaje de error estás viendo exactamente?',
        type: 'text',
        ticketId: '550e8400-e29b-41d4-a716-446655440020',
        senderId: '550e8400-e29b-41d4-a716-446655440011', // Juan Técnico
        replyToId: '550e8400-e29b-41d4-a716-446655440030',
        isRead: true,
        readAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        metadata: null,
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440032',
        content: 'El error dice "Connection timeout" y aparece después de unos 30 segundos.',
        type: 'text',
        ticketId: '550e8400-e29b-41d4-a716-446655440020',
        senderId: '550e8400-e29b-41d4-a716-446655440013', // Miguel Usuario
        replyToId: '550e8400-e29b-41d4-a716-446655440031',
        isRead: true,
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        metadata: null,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440033',
        content: 'Hola, mi Outlook se está cerrando constantemente.',
        type: 'text',
        ticketId: '550e8400-e29b-41d4-a716-446655440021',
        senderId: '550e8400-e29b-41d4-a716-446655440014', // Ana García
        replyToId: null,
        isRead: true,
        readAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        metadata: null,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440034',
        content: 'Hola Ana, he tomado tu ticket. Voy a revisar el problema con Outlook. ¿Has intentado reiniciar el equipo?',
        type: 'text',
        ticketId: '550e8400-e29b-41d4-a716-446655440021',
        senderId: '550e8400-e29b-41d4-a716-446655440011', // Juan Técnico
        replyToId: '550e8400-e29b-41d4-a716-446655440033',
        isRead: true,
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        metadata: null,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ], { returning: true });

    // Create sample notifications
    await queryInterface.bulkInsert('Notifications', [
      {
        id: '550e8400-e29b-41d4-a716-446655440040',
        title: 'Nuevo ticket asignado',
        message: 'Se te ha asignado el ticket "Outlook se cierra al iniciar"',
        type: 'ticket_assigned',
        userId: '550e8400-e29b-41d4-a716-446655440011', // Juan Técnico
        ticketId: '550e8400-e29b-41d4-a716-446655440021',
        isRead: true,
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        metadata: JSON.stringify({
          priority: 'medium',
          customer: 'Ana García'
        }),
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440041',
        title: 'Ticket resuelto',
        message: 'El ticket "Problema con impresora de red" ha sido resuelto',
        type: 'success',
        userId: '550e8400-e29b-41d4-a716-446655440013', // Miguel Usuario
        ticketId: '550e8400-e29b-41d4-a716-446655440022',
        isRead: false,
        readAt: null,
        metadata: JSON.stringify({
          technician: 'Soporte al Producto',
          resolutionTime: '45 minutos'
        }),
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ], { returning: true });

    // Create sample ticket history
    await queryInterface.bulkInsert('TicketHistory', [
      {
        id: '550e8400-e29b-41d4-a716-446655440050',
        ticketId: '550e8400-e29b-41d4-a716-446655440021',
        action: 'created',
        oldValue: null,
        newValue: 'open',
        changedById: '550e8400-e29b-41d4-a716-446655440014', // Ana García
        metadata: JSON.stringify({
          title: 'Outlook se cierra al iniciar',
          priority: 'medium'
        }),
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440051',
        ticketId: '550e8400-e29b-41d4-a716-446655440021',
        action: 'assigned',
        oldValue: null,
        newValue: '550e8400-e29b-41d4-a716-446655440011',
        changedById: '550e8400-e29b-41d4-a716-446655440010', // Admin
        metadata: JSON.stringify({
          technician: 'Juan Técnico'
        }),
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440052',
        ticketId: '550e8400-e29b-41d4-a716-446655440021',
        action: 'status_changed',
        oldValue: 'open',
        newValue: 'in_progress',
        changedById: '550e8400-e29b-41d4-a716-446655440011', // Juan Técnico
        metadata: JSON.stringify({
          reason: 'Iniciando diagnóstico'
        }),
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ], { returning: true });
  },

  down: async (queryInterface, Sequelize) => {
    // Delete in reverse order due to foreign key constraints
    await queryInterface.bulkDelete('TicketHistory', null, {});
    await queryInterface.bulkDelete('Notifications', null, {});
    await queryInterface.bulkDelete('Messages', null, {});
    await queryInterface.bulkDelete('Tickets', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
