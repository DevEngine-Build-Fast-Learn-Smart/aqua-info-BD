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
export type TeamRole = string;
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  permissions: AdminModule[];
  status: 'active' | 'suspended';
  joined: string;
}
export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: AdminModule[];
  system?: boolean;
}
export const modules: { id: AdminModule; name: string; description: string }[] = [
  { id: 'homepage', name: 'Homepage', description: 'Arrange sections and select the lead story.' },
  {
    id: 'articles',
    name: 'Stories & field reports',
    description: 'Write, edit, and publish stories.',
  },
  { id: 'videos', name: 'Video reports', description: 'Publish video stories and manage footage.' },
  { id: 'resources', name: 'Knowledge hub', description: 'Publish guides and manage documents.' },
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
  { id: 'team', name: 'Team & access', description: 'Reserved for the superadmin.' },
];
export const rolePermissions: Record<string, AdminModule[]> = {
  owner: modules.map((module) => module.id),
  editor: ['homepage', 'articles', 'videos', 'resources', 'categories', 'footer'],
  contributor: ['articles', 'videos', 'resources'],
  viewer: [],
};
export const roleDescriptions: Record<string, string> = {
  owner: 'Full publication access and team management.',
  editor: 'Manage editorial content and the front page.',
  contributor: 'Work on stories, videos, and knowledge resources.',
  viewer: 'Read the workspace overview without editing access.',
};
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
