import { useState } from 'react';
import { initials } from '../../features/admin/access/access';
import { assetUrl } from '../../lib/utils';
export function Avatar({
  user,
  size = 'medium',
  className = '',
}: {
  user: { name: string; avatarUrl?: string } | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  const [failed, setFailed] = useState('');
  const source = user?.avatarUrl || '';
  return (
    <span
      className={`account-avatar avatar-${size} ${className}`}
      aria-label={user?.name || 'Account'}
    >
      {source && failed !== source ? (
        <img src={assetUrl(source)} alt="" onError={() => setFailed(source)} />
      ) : (
        <span>{initials(user?.name || 'Account')}</span>
      )}
    </span>
  );
}
