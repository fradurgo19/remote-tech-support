export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'customer';
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
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
  receiverId: string;
  timestamp: string;
  ticketId: string;
  type: 'text' | 'file' | 'system';
  attachment?: {
    name: string;
    url: string;
    type: string;
    size: number;
  };
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