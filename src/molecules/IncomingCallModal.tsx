import { PhoneCall, PhoneOff } from 'lucide-react';
import React from 'react';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';
import { Card, CardContent } from '../atoms/Card';
import { User as UserType } from '../types';

interface IncomingCallModalProps {
  isOpen: boolean;
  caller: UserType;
  ticketId: string;
  callSessionId: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  caller,
  ticketId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callSessionId,
  onAccept,
  onDecline,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <Card className='w-full max-w-md mx-4'>
        <CardContent className='p-6'>
          <div className='text-center'>
            {/* Caller Avatar */}
            <div className='mb-6'>
              <div className='relative inline-block'>
                <Avatar
                  src={caller.avatar}
                  size='xl'
                  status={caller.status}
                  className='mx-auto'
                />
                <div className='absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full'>
                  <PhoneCall size={16} className='text-white' />
                </div>
              </div>
            </div>

            {/* Caller Info */}
            <div className='mb-6'>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                📞 Llamada Entrante
              </h3>
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3'>
                <p className='text-lg font-semibold text-gray-900 mb-1'>
                  {caller.name}
                </p>
                <p className='text-sm text-blue-600 font-medium'>
                  {caller.email}
                </p>
              </div>
              <p className='text-xs text-gray-500'>
                📋 Ticket: {ticketId.slice(0, 8)}...
              </p>
            </div>

            {/* Call Actions */}
            <div className='flex gap-4 justify-center'>
              <Button
                variant='destructive'
                size='lg'
                onClick={onDecline}
                className='flex items-center gap-2 px-6'
              >
                <PhoneOff size={20} />
                Rechazar
              </Button>

              <Button
                size='lg'
                onClick={onAccept}
                className='flex items-center gap-2 px-6 bg-green-600 hover:bg-green-700'
              >
                <PhoneCall size={20} />
                Aceptar
              </Button>
            </div>

            {/* Call Status */}
            <div className='mt-4 text-xs text-gray-400'>
              <p>Esta es una videollamada de soporte técnico</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
