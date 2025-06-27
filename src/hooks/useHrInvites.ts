import { useEffect, useState } from 'react';

export interface HrInvite {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateSent: string;
  message: string;
  lastReinviteDate?: string;
  reinviteCount?: number;
}

export function useHrInvites() {
  const [sentInvites, setSentInvites] = useState<HrInvite[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hr_sent_invites');
    if (saved) {
      try {
        setSentInvites(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('hr_sent_invites', JSON.stringify(sentInvites));
    }
  }, [sentInvites, loaded]);

  return { sentInvites, setSentInvites };
}
