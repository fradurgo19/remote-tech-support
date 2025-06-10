import { sequelize } from '../config/database';
import { User, Ticket, Message } from '../models';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      status: 'online',
    });

    // Create technician user
    const techPassword = await bcrypt.hash('tech123', 10);
    const technician = await User.create({
      name: 'Technician',
      email: 'tech@example.com',
      password: techPassword,
      role: 'technician',
      status: 'online',
    });

    // Create customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await User.create({
      name: 'Customer',
      email: 'customer@example.com',
      password: customerPassword,
      role: 'customer',
      status: 'online',
    });

    // Create sample ticket
    const ticket = await Ticket.create({
      title: 'Sample Support Ticket',
      description: 'This is a sample support ticket for testing purposes.',
      status: 'open',
      priority: 'medium',
      category: 'Soporte Remoto',
      customerId: customer.id,
      technicianId: technician.id,
    });

    // Create sample messages
    await Message.create({
      content: 'Hello, I need help with my issue.',
      ticketId: ticket.id,
      senderId: customer.id,
      type: 'text',
    });

    await Message.create({
      content: 'Hi, I\'ll help you with that. Could you provide more details?',
      ticketId: ticket.id,
      senderId: technician.id,
      type: 'text',
    });

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
}

seed(); 