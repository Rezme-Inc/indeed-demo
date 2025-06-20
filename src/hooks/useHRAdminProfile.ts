import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getHRAdminProfile, HRAdminProfile } from '@/lib/services/hrAdmin';

export function useHRAdminProfile() {
  const [hrAdmin, setHrAdmin] = useState<HRAdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setHrAdmin(null);
        setLoading(false);
        return;
      }

      const profile = await getHRAdminProfile(session.user.id);
      setHrAdmin(profile);
    } catch (err) {
      console.error('Error loading HR admin profile:', err);
      setError('Failed to load HR admin profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { hrAdmin, loading, error, refresh: fetchProfile };
}
