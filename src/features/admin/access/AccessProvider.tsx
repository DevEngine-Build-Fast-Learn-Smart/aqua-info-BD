import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  ACCESS_KEY,
  DEMO_PASSWORD,
  SESSION_KEY,
  passwordDigest,
  readMembers,
  type AdminModule,
  type TeamMember,
} from './access';

interface AccessContext {
  members: TeamMember[];
  currentUser: TeamMember | null;
  can: (module: AdminModule) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  saveMember: (
    member: Omit<TeamMember, 'salt' | 'passwordHash'>,
    password?: string,
  ) => Promise<void>;
  setMemberStatus: (id: string, status: TeamMember['status']) => void;
}
const Context = createContext<AccessContext | null>(null);
export function AccessProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState(readMembers);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  });
  const currentUser =
    members.find((member) => member.id === sessionId && member.status === 'active') || null;
  const persist = useCallback((next: TeamMember[]) => {
    localStorage.setItem(ACCESS_KEY, JSON.stringify(next));
    setMembers(next);
  }, []);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === ACCESS_KEY || event.key === null) setMembers(readMembers());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  async function signIn(email: string, password: string) {
    const latest = readMembers();
    const member = latest.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (!member || member.status !== 'active')
      throw new Error('The sign-in details don’t match an active local account.');
    const matches =
      member.id === 'workspace-owner'
        ? password === DEMO_PASSWORD
        : (await passwordDigest(password, member.salt)) === member.passwordHash;
    if (!matches) throw new Error('The sign-in details don’t match an active local account.');
    sessionStorage.setItem(SESSION_KEY, member.id);
    setMembers(latest);
    setSessionId(member.id);
  }
  function signOut() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } finally {
      setSessionId(null);
    }
  }
  async function saveMember(member: Omit<TeamMember, 'salt' | 'passwordHash'>, password?: string) {
    if (currentUser?.role !== 'owner')
      throw new Error('Only the workspace owner can manage team access.');
    const latest = readMembers();
    if (member.id === 'workspace-owner' || member.role === 'owner')
      throw new Error('The workspace owner cannot be changed in this preview.');
    if (
      latest.some(
        (item) =>
          item.id !== member.id && item.email.toLowerCase() === member.email.trim().toLowerCase(),
      )
    )
      throw new Error('This email already belongs to a local team account.');
    const existing = latest.find((item) => item.id === member.id);
    if (!existing && !password) throw new Error('Add a demo password for the new account.');
    const salt = password ? crypto.randomUUID() : existing!.salt;
    const passwordHash = password ? await passwordDigest(password, salt) : existing!.passwordHash;
    const next: TeamMember = {
      ...member,
      name: member.name.trim(),
      email: member.email.trim().toLowerCase(),
      permissions: member.permissions.filter((permission) => permission !== 'team'),
      salt,
      passwordHash,
    };
    persist(
      existing ? latest.map((item) => (item.id === member.id ? next : item)) : [...latest, next],
    );
  }
  function setMemberStatus(id: string, status: TeamMember['status']) {
    if (currentUser?.role !== 'owner' || id === 'workspace-owner')
      throw new Error('Only the workspace owner can change team access.');
    persist(readMembers().map((member) => (member.id === id ? { ...member, status } : member)));
  }
  return (
    <Context.Provider
      value={{
        members,
        currentUser,
        can: (module) =>
          !!currentUser &&
          (currentUser.role === 'owner' ||
            (module !== 'team' && currentUser.permissions.includes(module))),
        signIn,
        signOut,
        saveMember,
        setMemberStatus,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAccess() {
  const context = useContext(Context);
  if (!context) throw new Error('useAccess requires AccessProvider');
  return context;
}
