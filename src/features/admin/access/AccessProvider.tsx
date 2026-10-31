import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, allPages, ApiError } from '../../../lib/api';
import { useSite } from '../../../app/SiteProvider';
import type { AdminModule, RoleDefinition, TeamMember } from './access';

interface AccessContext {
  updateProfile: (profile: { name: string; avatarUrl: string }) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  members: TeamMember[];
  roles: RoleDefinition[];
  currentUser: TeamMember | null;
  loading: boolean;
  authError: string;
  retry: () => void;
  can: (module: AdminModule) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveMember: (member: TeamMember, password?: string) => Promise<void>;
  setMemberStatus: (id: string, status: TeamMember['status']) => Promise<void>;
  saveRole: (role: RoleDefinition) => Promise<void>;
}
const Context = createContext<AccessContext | null>(null);
function announce(signedIn: boolean) {
  window.dispatchEvent(new CustomEvent('aqua:auth-changed', { detail: signedIn }));
}
export function AccessProvider({ children }: { children: ReactNode }) {
  const { notify } = useSite();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const loadTeam = useCallback(async () => {
    const [team, definitions] = await Promise.all([
      allPages<TeamMember>('/admin/team/'),
      allPages<RoleDefinition>('/admin/roles/'),
    ]);
    setMembers(team);
    setRoles(definitions);
  }, []);
  const restore = useCallback(
    async (visible = true) => {
      if (visible) setLoading(true);
      setAuthError('');
      try {
        const user = await api<TeamMember>('/auth/me/');
        setCurrentUser(user);
        if (visible) announce(true);
        if (user.role === 'owner') await loadTeam();
        else {
          setMembers([user]);
          setRoles([]);
        }
      } catch (reason) {
        if (reason instanceof ApiError && reason.status === 401) {
          setCurrentUser(null);
          setMembers([]);
          if (visible) announce(false);
        } else if (visible)
          setAuthError(
            reason instanceof Error ? reason.message : 'Your session could not be checked.',
          );
      } finally {
        if (visible) setLoading(false);
      }
    },
    [loadTeam],
  );
  useEffect(() => {
    void restore();
    const ended = () => {
      setCurrentUser(null);
      setMembers([]);
      announce(false);
    };
    window.addEventListener('aqua:session-ended', ended);
    return () => window.removeEventListener('aqua:session-ended', ended);
  }, [restore]);
  useEffect(() => {
    if (!currentUser) return;
    const timer = setInterval(() => void restore(false), 4 * 60 * 1000);
    const focus = () => {
      if (document.visibilityState === 'visible') void restore(false);
    };
    document.addEventListener('visibilitychange', focus);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', focus);
    };
  }, [currentUser?.id, restore]);
  async function signIn(email: string, password: string) {
    const result = await api<{ user: TeamMember }>('/auth/login/', {
      method: 'POST',
      body: { email, password },
      retry: false,
    });
    setCurrentUser(result.user);
    setAuthError('');
    announce(true);
    if (result.user.role === 'owner') {
      try {
        await loadTeam();
      } catch {
        notify('Signed in. Reload Team & access if the team list is unavailable.');
      }
    } else setMembers([result.user]);
  }
  async function signOut() {
    try {
      await api('/auth/logout/', { method: 'POST', retry: false });
      setCurrentUser(null);
      setMembers([]);
      setRoles([]);
      announce(false);
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Could not sign out. Please try again.');
    }
  }
  async function saveMember(member: TeamMember, password?: string) {
    const existing = members.some((item) => item.id === member.id);
    const inherited = roles.find((role) => role.id === member.role)?.permissions || [];
    const permissions =
      JSON.stringify([...member.permissions].sort()) === JSON.stringify([...inherited].sort())
        ? null
        : member.permissions;
    const body = {
      name: member.name,
      email: member.email,
      role: member.role,
      permissions,
      status: member.status,
      ...(password ? { password } : {}),
    };
    await api(existing ? `/admin/team/${member.id}/` : '/admin/team/', {
      method: existing ? 'PATCH' : 'POST',
      body,
    });
    await loadTeam();
  }
  async function setMemberStatus(id: string, status: TeamMember['status']) {
    await api(`/admin/team/${id}/`, { method: 'PATCH', body: { status } });
    await loadTeam();
  }
  async function saveRole(role: RoleDefinition) {
    await api(`/admin/roles/${roles.some((item) => item.id === role.id) ? `${role.id}/` : ''}`, {
      method: roles.some((item) => item.id === role.id) ? 'PATCH' : 'POST',
      body: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      },
    });
    await loadTeam();
  }
  async function updateProfile(profile: { name: string; avatarUrl: string }) {
    const user = await api<TeamMember>('/auth/profile/', { method: 'PATCH', body: profile });
    setCurrentUser(user);
    setMembers((previous) => previous.map((member) => (member.id === user.id ? user : member)));
  }
  async function deleteMember(id: string) {
    await api('/admin/team/' + id + '/', { method: 'DELETE' });
    setMembers((previous) => previous.filter((member) => member.id !== id));
  }
  async function deleteRole(id: string) {
    await api('/admin/roles/' + id + '/', { method: 'DELETE' });
    setRoles((previous) => previous.filter((role) => role.id !== id));
  }
  return (
    <Context.Provider
      value={{
        updateProfile,
        deleteMember,
        deleteRole,
        members,
        roles,
        currentUser,
        loading,
        authError,
        retry: () => void restore(),
        can: (module) =>
          !!currentUser &&
          (currentUser.role === 'owner' || currentUser.permissions.includes(module)),
        signIn,
        signOut,
        saveMember,
        setMemberStatus,
        saveRole,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAccess() {
  const value = useContext(Context);
  if (!value) throw new Error('useAccess requires AccessProvider');
  return value;
}
