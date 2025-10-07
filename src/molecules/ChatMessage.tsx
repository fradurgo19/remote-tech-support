import React from 'react';
import { Avatar } from '../atoms/Avatar';
import { Message, User } from '../types';
import { cn } from '../utils/cn';
import { FileText, Download } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  sender?: User;
  isOwn: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  sender,
  isOwn
}) => {
  const { content, createdAt, type, metadata } = message;
  const attachment = metadata?.attachment;
  const formattedTime = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-muted px-3 py-1 rounded-md text-sm text-muted-foreground">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex gap-3 max-w-[80%] mb-2',
      isOwn ? 'ml-auto flex-row-reverse' : ''
    )}>
      {!isOwn && sender && (
        <Avatar
          src={sender.avatar}
          size="sm"
          status={sender.status}
          className="mt-1"
        />
      )}

      <div className={cn(
        'flex flex-col',
        isOwn ? 'items-end' : 'items-start'
      )}>
        {!isOwn && sender && (
          <span className="text-xs text-muted-foreground mb-1">{sender.name}</span>
        )}

        <div className={cn(
          'rounded-lg px-3 py-2',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-card border border-border',
        )}>
          {type === 'text' && <p className="text-sm">{content}</p>}
          
          {type === 'file' && attachment && (
            <div className="flex items-center gap-2">
              <FileText size={18} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                <p className="text-xs opacity-70">
                  {attachment.size > 1024 * 1024 
                    ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB`
                    : `${Math.round(attachment.size / 1024)} KB`
                  }
                </p>
              </div>
              <a
                href={attachment.url.startsWith('http') ? attachment.url : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${attachment.url}`}
                download={attachment.name}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 p-1 rounded-full hover:bg-background/20 transition-colors"
                aria-label="Descargar archivo"
              >
                <Download size={16} />
              </a>
            </div>
          )}
        </div>

        <span className="text-xs text-muted-foreground mt-1">{formattedTime}</span>
      </div>
    </div>
  );
};