import React from 'react';
import { useCall } from '../context/CallContext';
import { IncomingCallModal } from '../molecules/IncomingCallModal';

export const IncomingCallHandler: React.FC = () => {
  const { incomingCall, acceptIncomingCall, declineIncomingCall } = useCall();

  if (!incomingCall?.isIncoming) {
    return null;
  }

  return (
    <IncomingCallModal
      isOpen={incomingCall.isIncoming}
      caller={incomingCall.caller}
      ticketId={incomingCall.ticketId}
      callSessionId={incomingCall.callSessionId}
      onAccept={acceptIncomingCall}
      onDecline={declineIncomingCall}
    />
  );
};
