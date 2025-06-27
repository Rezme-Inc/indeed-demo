import { useState } from 'react';

interface Invite {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateSent: string;
  message: string;
  lastReinviteDate?: string;
  reinviteCount?: number;
}

export const useHrInvites = () => {
  const [sentInvites, setSentInvites] = useState<Invite[]>([]);

  return {
    sentInvites,
    setSentInvites,
  };
}; 