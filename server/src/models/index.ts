import { User } from './User';
import { Ticket } from './Ticket';
import { Message } from './Message';
import { Category } from './Category';
import { Attachment } from './Attachment';
import { CallSession } from './CallSession';
import { Notification } from './Notification';
import { TicketHistory } from './TicketHistory';
import { Report } from './Report';

// Define all associations
import { sequelize } from '../config/database';

// User associations
User.hasMany(Ticket, { as: 'customerTickets', foreignKey: 'customerId' });
User.hasMany(Ticket, { as: 'technicianTickets', foreignKey: 'technicianId' });
User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });
User.hasMany(Attachment, { as: 'uploadedAttachments', foreignKey: 'uploadedById' });
User.hasMany(CallSession, { as: 'initiatedCalls', foreignKey: 'initiatorId' });
User.hasMany(Notification, { foreignKey: 'userId' });
User.hasMany(TicketHistory, { as: 'ticketChanges', foreignKey: 'changedById' });
User.hasMany(Report, { as: 'authoredReports', foreignKey: 'authorId' });
User.hasMany(Report, { as: 'reviewedReports', foreignKey: 'reviewedById' });

// Ticket associations
Ticket.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
Ticket.belongsTo(User, { as: 'technician', foreignKey: 'technicianId' });
Ticket.belongsTo(Category, { foreignKey: 'categoryId' });
Ticket.hasMany(Message, { foreignKey: 'ticketId' });
Ticket.hasMany(Attachment, { foreignKey: 'ticketId' });
Ticket.hasMany(CallSession, { foreignKey: 'ticketId' });
Ticket.hasMany(Notification, { foreignKey: 'ticketId' });
Ticket.hasMany(TicketHistory, { foreignKey: 'ticketId' });
Ticket.hasMany(Report, { foreignKey: 'ticketId' });

// Message associations
Message.belongsTo(Ticket, { foreignKey: 'ticketId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(Message, { as: 'replyTo', foreignKey: 'replyToId' });
Message.hasMany(Message, { as: 'replies', foreignKey: 'replyToId' });
Message.hasMany(Attachment, { foreignKey: 'messageId' });

// Category associations
Category.hasMany(Ticket, { foreignKey: 'categoryId' });

// CallSession associations
CallSession.belongsTo(Ticket, { foreignKey: 'ticketId' });
CallSession.belongsTo(User, { as: 'initiator', foreignKey: 'initiatorId' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId' });
Notification.belongsTo(Ticket, { foreignKey: 'ticketId' });

// TicketHistory associations
TicketHistory.belongsTo(Ticket, { foreignKey: 'ticketId' });
TicketHistory.belongsTo(User, { as: 'changedBy', foreignKey: 'changedById' });

// Report associations
Report.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
Report.belongsTo(User, { as: 'reviewedBy', foreignKey: 'reviewedById' });
Report.belongsTo(Ticket, { foreignKey: 'ticketId' });

// Attachment associations
Attachment.belongsTo(User, { as: 'uploadedBy', foreignKey: 'uploadedById' });
Attachment.belongsTo(Message, { foreignKey: 'messageId' });
Attachment.belongsTo(Ticket, { foreignKey: 'ticketId' });

export {
  User,
  Ticket,
  Message,
  Category,
  Attachment,
  CallSession,
  Notification,
  TicketHistory,
  Report,
  sequelize,
}; 