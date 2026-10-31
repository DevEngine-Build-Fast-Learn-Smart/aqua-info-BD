import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  CheckCheck,
  Copy,
  Pencil,
  Plus,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
  Trash2,
  X,
} from 'lucide-react';
import { AdminPageHeader } from '../AdminPageHeader';
import { ConfirmDeleteDialog } from '../../../components/ui/ConfirmDeleteDialog';
import { Avatar } from '../../../components/ui/Avatar';
import { Modal } from '../../../components/ui/Modal';
import { useAccess } from './AccessProvider';
import {
  modules,
  roleDescriptions,
  rolePermissions,
  type TeamMember,
  type TeamRole,
  type RoleDefinition,
} from './access';
import { useSite } from '../../../app/SiteProvider';
import { slugify, today } from '../../../lib/utils';

type MemberForm = TeamMember;
export default function TeamPage() {
  const { members, roles, saveMember, setMemberStatus, saveRole, deleteMember, deleteRole } =
    useAccess();
  const { notify, siteName } = useSite();
  const [removing, setRemoving] = useState<{
    id: string;
    name: string;
    kind: 'member' | 'role';
  } | null>(null);
  const [editing, setEditing] = useState<MemberForm | null>(null);
  const [roleEditing, setRoleEditing] = useState<RoleDefinition | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [revoke, setRevoke] = useState<TeamMember | null>(null);
  const [credentials, setCredentials] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  function open(member?: TeamMember) {
    setEditing(
      member
        ? {
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            permissions: [...member.permissions],
            status: member.status,
            joined: member.joined,
          }
        : {
            id: crypto.randomUUID(),
            name: '',
            email: '',
            role: 'contributor',
            permissions: [...rolePermissions.contributor],
            status: 'active',
            joined: today(),
          },
    );
    setPassword('');
    setError('');
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError('');
    try {
      await saveMember(editing, password || undefined);
      if (password) setCredentials({ name: editing.name, email: editing.email, password });
      setEditing(null);
      setPassword('');
      setCopied(false);
      notify('Team account saved. No invitation email has been sent.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Team access could not be saved.');
    } finally {
      setBusy(false);
    }
  }
  async function copyCredentials() {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(
        `${siteName} — Editorial access\nSign in: ${window.location.origin}/admin/login\nEmail: ${credentials.email}\nPassword: ${credentials.password}\nKeep your sign-in details private.`,
      );
      setCopied(true);
    } catch {
      notify('Clipboard is unavailable. Select the sign-in details below to copy them.');
    }
  }
  async function changeStatus(member: TeamMember, status: TeamMember['status']) {
    try {
      await setMemberStatus(member.id, status);
      setRevoke(null);
      notify(
        status === 'active'
          ? 'Access restored.'
          : 'Access revoked. This account can no longer sign in.',
      );
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Access could not be updated.');
    }
  }
  const isNew = editing && !members.some((member) => member.id === editing.id);
  return (
    <>
      <AdminPageHeader
        eyebrow="08 / THE PEOPLE BEHIND THE PUBLICATION"
        title="A shared desk. The right access."
        description="Bring your team into the workflow and give everyone a clear place to contribute."
      >
        <button
          className="button button-outline"
          onClick={() => {
            setError('');
            setRoleEditing({ id: '', name: '', description: '', permissions: [] });
          }}
        >
          <Plus size={16} />
          Create a role
        </button>
        <button className="button button-primary" onClick={() => open()}>
          <Plus size={18} />
          Give someone access
        </button>
      </AdminPageHeader>
      <div className="team-summary">
        <div>
          <UsersRound size={23} />
          <strong>{members.length}</strong>
          <span>people at the desk</span>
        </div>
        <div>
          <UserRoundCheck size={23} />
          <strong>{members.filter((member) => member.status === 'active').length}</strong>
          <span>active accounts</span>
        </div>
        <div>
          <ShieldCheck size={23} />
          <p>
            <strong>Considered permissions</strong>
            <span>Choose exactly where each person can work.</span>
          </p>
        </div>
      </div>
      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <span className="tiny-square" />
            <h2>Your editorial team</h2>
          </div>
          <span className="caption">Owner-managed access</span>
        </div>
        <div className="table-scroll">
          <table className="data-table team-table">
            <thead>
              <tr>
                <th>PERSON</th>
                <th>ROLE & PERMISSIONS</th>
                <th>ACCESS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="team-person">
                      <Avatar user={member} />
                      <div>
                        <strong>{member.name}</strong>
                        <small>{member.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="team-role">{member.role}</span>
                    <div className="permission-tags">
                      {member.role === 'owner' ? (
                        <span>All areas · Team management</span>
                      ) : member.permissions.length ? (
                        member.permissions.map((permission) => (
                          <span key={permission}>
                            {modules.find((module) => module.id === permission)?.name}
                          </span>
                        ))
                      ) : (
                        <span>Overview only</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${member.status === 'active' ? 'published' : 'suspended'}`}
                    >
                      {member.status === 'active' ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td>
                    {member.role === 'owner' ? (
                      <span className="owner-label">
                        <ShieldCheck size={15} />
                        Workspace owner
                      </span>
                    ) : (
                      <div className="team-actions">
                        <button
                          className="icon-button"
                          aria-label={`Edit access for ${member.name}`}
                          onClick={() => open(member)}
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          className="icon-button danger-text"
                          aria-label={`Permanently delete ${member.name}`}
                          onClick={() =>
                            setRemoving({ id: member.id, name: member.name, kind: 'member' })
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                        <button
                          className={`text-link ${member.status === 'active' ? 'danger-text' : ''}`}
                          onClick={() =>
                            member.status === 'active'
                              ? setRevoke(member)
                              : changeStatus(member, 'active')
                          }
                        >
                          {member.status === 'active' ? 'Revoke' : 'Restore'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-footnote">
          Accounts and permissions are stored on the server and work across devices. Only the
          superadmin can create roles and manage team access. Share initial passwords privately;
          invitation emails are not sent.
        </div>
      </section>
      <div className="team-role-guide">
        {(['editor', 'contributor', 'viewer'] as const).map((role, index) => (
          <article key={role}>
            <span className="eyebrow">
              0{index + 1} / {role}
            </span>
            <h3>
              {role === 'editor'
                ? 'Shape the publication.'
                : role === 'contributor'
                  ? 'Bring a story to life.'
                  : 'Keep the bigger picture.'}
            </h3>
            <p>{roleDescriptions[role]}</p>
          </article>
        ))}
      </div>
      {roles.some((role) => !role.system) && (
        <section className="admin-panel role-library">
          <div className="panel-heading">
            <h2>Custom editorial roles</h2>
          </div>
          {roles
            .filter((role) => !role.system)
            .map((role) => (
              <div className="custom-role-row" key={role.id}>
                <div>
                  <strong>{role.name}</strong>
                  <p>{role.description}</p>
                  <small>{role.permissions.length} module permissions</small>
                </div>
                <button
                  className="text-link"
                  onClick={() => {
                    setRoleEditing({ ...role, permissions: [...role.permissions] });
                    setError('');
                  }}
                >
                  Edit role
                  <Pencil size={15} />
                </button>
                <button
                  className="icon-button danger-text"
                  aria-label={`Permanently delete role ${role.name}`}
                  onClick={() => setRemoving({ id: role.id, name: role.name, kind: 'role' })}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
        </section>
      )}
      {roleEditing && (
        <Modal title="Editorial role" onClose={() => !busy && setRoleEditing(null)} wide>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError('');
              try {
                await saveRole(roleEditing);
                setRoleEditing(null);
                notify('Editorial role saved.');
              } catch (reason) {
                setError(reason instanceof Error ? reason.message : 'The role could not be saved.');
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field">
              <span>ROLE NAME</span>
              <input
                required
                maxLength={80}
                value={roleEditing.name}
                onChange={(event) =>
                  setRoleEditing({
                    ...roleEditing,
                    name: event.target.value,
                    id: roles.some((role) => role.id === roleEditing.id)
                      ? roleEditing.id
                      : slugify(event.target.value),
                  })
                }
              />
            </label>
            <label className="field">
              <span>DESCRIPTION</span>
              <textarea
                maxLength={240}
                rows={3}
                value={roleEditing.description}
                onChange={(event) =>
                  setRoleEditing({ ...roleEditing, description: event.target.value })
                }
              />
            </label>
            <div className="permission-heading">
              <h3>Role permissions</h3>
            </div>
            <div className="permission-grid">
              {modules
                .filter((module) => module.id !== 'team')
                .map((module) => (
                  <label
                    className={`permission-option ${roleEditing.permissions.includes(module.id) ? 'permission-selected' : ''}`}
                    key={module.id}
                  >
                    <input
                      type="checkbox"
                      checked={roleEditing.permissions.includes(module.id)}
                      onChange={() =>
                        setRoleEditing({
                          ...roleEditing,
                          permissions: roleEditing.permissions.includes(module.id)
                            ? roleEditing.permissions.filter((value) => value !== module.id)
                            : [...roleEditing.permissions, module.id],
                        })
                      }
                    />
                    <span>
                      <strong>{module.name}</strong>
                      <small>{module.description}</small>
                    </span>
                    <Check size={16} />
                  </label>
                ))}
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="button button-outline"
                disabled={busy}
                onClick={() => setRoleEditing(null)}
              >
                Cancel
              </button>
              <button className="button button-primary" type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Save role'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {editing && (
        <Modal
          title={isNew ? 'A new place at the desk.' : `Access for ${editing.name}`}
          onClose={() => !busy && setEditing(null)}
          wide
        >
          <form className="team-editor" onSubmit={save}>
            <div className="form-grid">
              <label className="field">
                <span>FULL NAME *</span>
                <input
                  required
                  maxLength={80}
                  autoComplete="off"
                  value={editing.name}
                  onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                  placeholder="Team member’s name"
                />
              </label>
              <label className="field">
                <span>EMAIL ADDRESS *</span>
                <input
                  required
                  type="email"
                  autoComplete="off"
                  value={editing.email}
                  onChange={(event) => setEditing({ ...editing, email: event.target.value })}
                  placeholder="name@example.com"
                />
              </label>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>EDITORIAL ROLE</span>
                <select
                  value={editing.role}
                  onChange={(event) => {
                    const role = event.target.value as TeamRole;
                    setEditing({ ...editing, role, permissions: [...rolePermissions[role]] });
                  }}
                >
                  {roles
                    .filter((role) => role.id !== 'owner')
                    .map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                </select>
                <small>
                  {roles.find((role) => role.id === editing.role)?.description ||
                    roleDescriptions[editing.role]}
                </small>
              </label>
              <label className="field">
                <span>{isNew ? 'PASSWORD *' : 'NEW PASSWORD (OPTIONAL)'}</span>
                <input
                  required={!!isNew}
                  type="text"
                  autoComplete="off"
                  minLength={10}
                  maxLength={100}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    isNew ? 'At least 10 characters' : 'Leave blank to keep current password'
                  }
                />
                <small>Use a unique password. The server stores only its secure hash.</small>
              </label>
            </div>
            <div className="permission-heading">
              <h3>Where can they work?</h3>
              <span className="caption">Overview is always included.</span>
            </div>
            <div className="permission-grid">
              {modules
                .filter((module) => module.id !== 'team')
                .map((module) => (
                  <label
                    className={`permission-option ${editing.permissions.includes(module.id) ? 'permission-selected' : ''}`}
                    key={module.id}
                  >
                    <input
                      type="checkbox"
                      checked={editing.permissions.includes(module.id)}
                      onChange={() =>
                        setEditing({
                          ...editing,
                          permissions: editing.permissions.includes(module.id)
                            ? editing.permissions.filter((value) => value !== module.id)
                            : [...editing.permissions, module.id],
                        })
                      }
                    />
                    <span>
                      <strong>{module.name}</strong>
                      <small>{module.description}</small>
                    </span>
                    <Check size={16} />
                  </label>
                ))}
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="button button-outline"
                disabled={busy}
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="button button-primary" disabled={busy} type="submit">
                {busy ? 'Saving…' : isNew ? 'Create account' : 'Save permissions'}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {credentials && (
        <Modal title={`A place for ${credentials.name}.`} onClose={() => setCredentials(null)}>
          <div className="credentials-success">
            <CheckCheck size={29} />
            <p>The account is ready. Keep these sign-in details before closing this window.</p>
          </div>
          <dl className="credential-details">
            <div>
              <dt>SIGN-IN PAGE</dt>
              <dd>{window.location.origin}/admin/login</dd>
            </div>
            <div>
              <dt>EMAIL</dt>
              <dd>{credentials.email}</dd>
            </div>
            <div>
              <dt>PASSWORD</dt>
              <dd>{credentials.password}</dd>
            </div>
          </dl>
          <p className="caption">
            Sign out, then use this account to review its permissions. No email invitation has been
            sent.
          </p>
          <div className="modal-actions">
            <button className="button button-outline" onClick={() => setCredentials(null)}>
              Done
            </button>
            <button className="button button-primary" onClick={copyCredentials}>
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? 'Copied' : 'Copy sign-in details'}
            </button>
          </div>
        </Modal>
      )}
      {removing && (
        <ConfirmDeleteDialog
          name={removing.name}
          note={
            removing.kind === 'member'
              ? 'This account will lose access. Published content will be retained.'
              : 'Assigned users must be moved to another role before this role can be deleted.'
          }
          onClose={() => setRemoving(null)}
          onConfirm={async () => {
            if (removing.kind === 'member') await deleteMember(removing.id);
            else await deleteRole(removing.id);
            notify('Permanently deleted.');
          }}
        />
      )}
      {revoke && (
        <Modal title={`Revoke access for ${revoke.name}?`} onClose={() => setRevoke(null)}>
          <p>
            They will no longer be able to sign in to this workspace. You can restore access at any
            time.
          </p>
          <div className="modal-actions">
            <button className="button button-outline" onClick={() => setRevoke(null)}>
              Keep access
            </button>
            <button
              className="button button-danger"
              onClick={() => changeStatus(revoke, 'suspended')}
            >
              <X size={16} />
              Revoke access
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
