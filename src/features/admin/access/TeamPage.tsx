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
  X,
} from 'lucide-react';
import { AdminPageHeader } from '../AdminPageHeader';
import { Modal } from '../../../components/ui/Modal';
import { useAccess } from './AccessProvider';
import {
  initials,
  modules,
  roleDescriptions,
  rolePermissions,
  type TeamMember,
  type TeamRole,
} from './access';
import { useSite } from '../../../app/SiteProvider';
import { today } from '../../../lib/utils';

type MemberForm = Omit<TeamMember, 'salt' | 'passwordHash'>;
export default function TeamPage() {
  const { members, saveMember, setMemberStatus } = useAccess();
  const { notify } = useSite();
  const [editing, setEditing] = useState<MemberForm | null>(null);
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
      notify('Local team access saved. No invitation email has been sent.');
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
        `Aqua Info BD — Local demo access\nSign in: ${window.location.origin}/admin/login\nEmail: ${credentials.email}\nDemo password: ${credentials.password}\nThis account works only in the browser where it was created.`,
      );
      setCopied(true);
    } catch {
      notify('Clipboard is unavailable. Select the sign-in details below to copy them.');
    }
  }
  function changeStatus(member: TeamMember, status: TeamMember['status']) {
    try {
      setMemberStatus(member.id, status);
      setRevoke(null);
      notify(
        status === 'active'
          ? 'Local access restored.'
          : 'Local access revoked. This account can no longer sign in.',
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
          <span>active local accounts</span>
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
                      <span
                        className={`member-avatar ${member.role === 'owner' ? 'owner-avatar' : ''}`}
                      >
                        {initials(member.name)}
                      </span>
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
          This is a frontend access demo. Accounts are stored in this browser; no invitations are
          emailed and access does not transfer to other browsers or devices. Backend authentication
          will make this workflow permanent.
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
                  <option value="editor">Editor</option>
                  <option value="contributor">Contributor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <small>{roleDescriptions[editing.role]}</small>
              </label>
              <label className="field">
                <span>{isNew ? 'DEMO PASSWORD *' : 'NEW DEMO PASSWORD (OPTIONAL)'}</span>
                <input
                  required={!!isNew}
                  type="text"
                  autoComplete="off"
                  minLength={8}
                  maxLength={100}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    isNew ? 'At least 8 characters' : 'Leave blank to keep current password'
                  }
                />
                <small>Use a sample password, not a personal password.</small>
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
                {busy ? 'Saving…' : isNew ? 'Create local access' : 'Save permissions'}
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
            <p>
              The local account is ready. Keep these demo sign-in details before closing this
              window.
            </p>
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
              <dt>DEMO PASSWORD</dt>
              <dd>{credentials.password}</dd>
            </div>
          </dl>
          <p className="caption">
            Sign out, then use this account to review its permissions in this browser. No email
            invitation has been sent.
          </p>
          <div className="modal-actions">
            <button className="button button-outline" onClick={() => setCredentials(null)}>
              Done
            </button>
            <button className="button button-primary" onClick={copyCredentials}>
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? 'Copied' : 'Copy demo sign-in details'}
            </button>
          </div>
        </Modal>
      )}
      {revoke && (
        <Modal title={`Revoke access for ${revoke.name}?`} onClose={() => setRevoke(null)}>
          <p>
            They will no longer be able to sign in to this local workspace. You can restore access
            at any time.
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
