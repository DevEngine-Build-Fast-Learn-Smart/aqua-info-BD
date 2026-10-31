import { useState, type FormEvent } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { useAccess } from './access/AccessProvider';
import { useSite } from '../../app/SiteProvider';
import { AdminPageHeader } from './AdminPageHeader';
import { MediaInput } from '../../components/ui/MediaInput';
import { Avatar } from '../../components/ui/Avatar';
export default function ProfilePage() {
  const { currentUser, updateProfile } = useAccess();
  const { notify } = useSite();
  const [name, setName] = useState(currentUser?.name || ''),
    [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || ''),
    [busy, setBusy] = useState(false),
    [uploadBusy, setUploadBusy] = useState(false),
    [error, setError] = useState('');
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy || uploadBusy) return;
    setBusy(true);
    setError('');
    try {
      await updateProfile({ name, avatarUrl });
      notify('Your profile has been saved.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your profile could not be saved.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save}>
      <AdminPageHeader
        eyebrow="ACCOUNT / MY PROFILE"
        title="Your profile"
        description="Keep your workspace name and profile photo up to date. Every editorial role can manage its own profile."
      >
        <button className="button button-primary" disabled={busy || uploadBusy}>
          <Save size={17} />
          {busy ? 'Saving…' : 'Save profile'}
        </button>
      </AdminPageHeader>
      <div className="account-profile-grid">
        <section className="admin-panel panel-padding">
          <div className="account-profile-preview">
            <Avatar user={{ name, avatarUrl }} size="large" />
            <div>
              <h2>{name || 'Your name'}</h2>
              <p>{currentUser?.email}</p>
              <span className="profile-role">
                <ShieldCheck size={15} />
                {currentUser?.role}
              </span>
            </div>
          </div>
          <MediaInput
            label="Profile picture · upload or image link"
            value={avatarUrl}
            onChange={setAvatarUrl}
            purpose="profile"
            disabled={busy}
            onBusyChange={setUploadBusy}
          />
          <label className="field">
            <span>Display name</span>
            <input
              required
              minLength={1}
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={busy}
              autoComplete="name"
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </section>
        <aside className="admin-panel panel-padding">
          <h2>Your account access</h2>
          <p className="muted">
            Your profile photo appears in the dashboard, workspace header and team directory. Your
            role and section access are managed by the superadmin.
          </p>
          <p className="caption">
            This account profile is separate from the public Authors & Contributors directory.
          </p>
        </aside>
      </div>
    </form>
  );
}
