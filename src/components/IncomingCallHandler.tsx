import React from 'react';
import { useCall } from '../context/CallContext';
import { IncomingCallModal } from '../molecules/IncomingCallModal';

export const IncomingCallHandler: React.FC = () => {
  const { incomingCall, acceptIncomingCall, declineIncomingCall } = useCall();

  console.log('=== INCOMING CALL HANDLER RENDER ===');
  console.log('incomingCall:', incomingCall ? JSON.stringify(incomingCall, null, 2) : 'null');
  console.log('incomingCall?.isIncoming:', incomingCall?.isIncoming);

  if (!incomingCall?.isIncoming) {
    console.log('IncomingCallHandler: NO hay llamada entrante, no renderizar modal');
    return null;
  }

  console.log('IncomingCallHandler: SÍ hay llamada entrante, renderizando modal');

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
