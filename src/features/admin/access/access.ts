export type AdminModule =
  | 'homepage'
  | 'articles'
  | 'videos'
  | 'resources'
  | 'market'
  | 'categories'
  | 'footer'
  | 'settings'
  | 'team';
export type TeamRole = 'owner' | 'editor' | 'contributor' | 'viewer';
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  permissions: AdminModule[];
  status: 'active' | 'suspended';
  joined: string;
  salt: string;
  passwordHash: string;
}

export const ACCESS_KEY = 'aqua:editorial-access:v1';
export const SESSION_KEY = 'aqua:editorial-session:v1';
export const DEMO_EMAIL = 'admin@aquainfobd.com';
export const DEMO_PASSWORD = 'AquaDemo@2026';
export const modules: { id: AdminModule; name: string; description: string }[] = [
  { id: 'homepage', name: 'Homepage', description: 'Arrange sections and select the lead story.' },
  {
    id: 'articles',
    name: 'Stories & field reports',
    description: 'Write, edit, and publish local stories.',
  },
  { id: 'videos', name: 'Video reports', description: 'Manage visual field-report previews.' },
  { id: 'resources', name: 'Knowledge hub', description: 'Curate guides and worksheets.' },
  { id: 'market', name: 'Market benchmark', description: 'Update the sample market prices.' },
  {
    id: 'categories',
    name: 'Editorial categories',
    description: 'Organize the publication’s topics.',
  },
  {
    id: 'footer',
    name: 'Website footer',
    description: 'Manage footer content, links, and visibility.',
  },
  {
    id: 'settings',
    name: 'Publication settings',
    description: 'Edit the brand and contact details.',
  },
  { id: 'team', name: 'Team & access', description: 'Reserved for the workspace owner.' },
];
export const rolePermissions: Record<TeamRole, AdminModule[]> = {
  owner: modules.map((module) => module.id),
  editor: ['homepage', 'articles', 'videos', 'resources', 'market', 'categories', 'footer'],
  contributor: ['articles', 'videos', 'resources'],
  viewer: [],
};
export const roleDescriptions: Record<TeamRole, string> = {
  owner: 'Full publication access and team management.',
  editor: 'Manage editorial content and the front page.',
  contributor: 'Work on stories, videos, and knowledge resources.',
  viewer: 'Read the workspace overview without editing access.',
};
const owner: TeamMember = {
  id: 'workspace-owner',
  name: 'Aqua Editorial',
  email: DEMO_EMAIL,
  role: 'owner',
  permissions: rolePermissions.owner,
  status: 'active',
  joined: '2026-10-28',
  salt: '',
  passwordHash: '',
};
export function readMembers(): TeamMember[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(ACCESS_KEY) || 'null');
    if (Array.isArray(saved)) {
      const members = saved.filter(
        (value): value is TeamMember =>
          value &&
          typeof value.id === 'string' &&
          typeof value.name === 'string' &&
          typeof value.email === 'string' &&
          Object.hasOwn(rolePermissions, value.role) &&
          Array.isArray(value.permissions) &&
          ['active', 'suspended'].includes(value.status) &&
          typeof value.salt === 'string' &&
          typeof value.passwordHash === 'string',
      );
      return [
        { ...owner },
        ...members
          .filter((member) => member.id !== owner.id)
          .map((member) => ({
            ...member,
            role: member.role === 'owner' ? ('viewer' as const) : member.role,
            permissions: member.permissions.filter(
              (permission) =>
                permission !== 'team' && modules.some((module) => module.id === permission),
            ),
          })),
      ];
    }
  } catch {
    /* A fresh local demo is available when browser data is missing. */
  }
  return [{ ...owner }];
}
export async function passwordDigest(password: string, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
