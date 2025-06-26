import { useEffect, useState } from 'react';
import { getPermittedUsers, PermittedUser } from '@/lib/services/hrAdmin';

export function usePermittedUsers(hrAdminId?: string | null) {
  const [users, setUsers] = useState<PermittedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!hrAdminId) return;
    setLoading(true);
    setError(null);
    try {
      const list = await getPermittedUsers(hrAdminId);
      setUsers(list);
    } catch (err) {
      console.error('Error loading permitted users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hrAdminId]);

  return { users, loading, error, refresh: fetchUsers };
}
