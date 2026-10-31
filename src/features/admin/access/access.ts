import { contentSections, type ContentSection } from '../../../data/catalog';
export type AdminModule =
  ContentSection | 'homepage' | 'authors' | 'categories' | 'pages' | 'footer' | 'settings' | 'team';
export type TeamRole = string;
export interface TeamMember {
  avatarUrl?: string;
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
  {
    id: 'homepage',
    name: 'Homepage',
    description: 'Arrange featured content and the latest updates.',
  },
  ...contentSections.map((section) => ({
    id: section.id,
    name: section.name,
    description: section.description,
  })),
  {
    id: 'authors',
    name: 'Authors & Contributors',
    description: 'Manage public profiles and the website team.',
  },
  {
    id: 'categories',
    name: 'Categories',
    description: 'Manage topics within the client’s content sections.',
  },
  {
    id: 'pages',
    name: 'About & Editorial Policy',
    description: 'Edit mission, team introduction, contact policy and submission guidance.',
  },
  { id: 'footer', name: 'Website footer', description: 'Edit footer links and bilingual text.' },
  {
    id: 'settings',
    name: 'Website settings',
    description: 'Manage website logo, branding and contact details.',
  },
  { id: 'team', name: 'Users & Role Access', description: 'Reserved for the superadmin.' },
];
export const rolePermissions: Record<string, AdminModule[]> = {
  owner: modules.map((module) => module.id),
  editor: modules
    .filter((module) => !['settings', 'team'].includes(module.id))
    .map((module) => module.id),
  contributor: contentSections.map((section) => section.id),
  viewer: [],
};
export const roleDescriptions: Record<string, string> = {
  owner: 'Full website access and user management.',
  editor: 'Manage content, profiles, pages and the homepage.',
  contributor: 'Create and publish content in the assigned sections.',
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
