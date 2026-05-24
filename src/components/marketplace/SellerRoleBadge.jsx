import React from 'react';
import { Badge } from '@/components/ui/badge';
import { roleColors } from '@/constants/profile';
import { RoleIcon, formatRoleLabel, getProfilePrimaryRole } from '@/constants/valueChainIcons';

/**
 * @param {{ profile?: object | null, size?: 'sm' | 'md' }} props
 */
export default function SellerRoleBadge({ profile, size = 'sm' }) {
  const role = getProfilePrimaryRole(profile);
  if (!role) return null;

  const sizeClass = size === 'md' ? 'text-xs px-2 py-0.5 gap-1' : 'text-[10px] px-1.5 py-0.5 gap-1';

  return (
    <Badge variant="outline" className={`${roleColors[role] || 'bg-muted text-muted-foreground'} ${sizeClass} capitalize`}>
      <RoleIcon role={role} className="w-3 h-3" />
      {formatRoleLabel(role)}
    </Badge>
  );
}
