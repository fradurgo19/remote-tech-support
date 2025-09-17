export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'customer';
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  emailVerified: boolean;
  passwordResetToken: string | null;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'technician' | 'customer';
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  customerId: string;
  technicianId?: string;
  category: string;
  tags: string[];
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId?: string;
  createdAt: string;
  updatedAt: string;
  ticketId: string;
  type: 'text' | 'file' | 'system' | 'image' | 'call_start' | 'call_end';
  metadata?: {
    fileUrl?: string;
    attachment?: {
      name: string;
      url: string;
      type: string;
      size: number;
    };
  };
  sender?: User;
}

export interface CallSession {
  id: string;
  ticketId: string;
  participants: string[];
  startTime: string;
  endTime?: string;
  recordingUrl?: string;
  status: 'scheduled' | 'active' | 'ended';
}

export interface Report {
  id: string;
  title: string;
  description: string;
  type: 'technical' | 'incident' | 'maintenance' | 'performance' | 'security';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  authorId: string;
  customerId: string;
  reviewedById?: string;
  ticketId?: string;
  reviewedAt?: string;
  tags?: string[];
  attachments?: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  author?: User;
  customer?: User;
  reviewedBy?: User;
  ticket?: Ticket;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface PeerConnection {
  peerId: string;
  stream: MediaStream;
}
