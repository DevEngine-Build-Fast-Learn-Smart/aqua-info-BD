import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Waves } from 'lucide-react';
import { useAccess } from './AccessProvider';
import { usePageMeta } from '../../../lib/usePageMeta';
import { useSite } from '../../../app/SiteProvider';
import { Brand } from '../../../components/layout/Brand';

export default function LoginPage() {
  const { siteName } = useSite();
  usePageMeta('Sign in', undefined, undefined, { noIndex: true });
  const { currentUser, signIn } = useAccess();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const from = (location.state as { from?: string } | null)?.from;
  const destination =
    from?.startsWith('/admin/') && !from.startsWith('/admin/login') ? from : '/admin/';
  if (currentUser) return <Navigate to={destination} replace />;
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
      navigate(destination, { replace: true });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Sign-in could not be completed. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page" lang="en">
      <section className="login-story">
        <div className="login-story-top">
          <Brand light />
          <span className="login-edition">EDITORIAL WORKSPACE / 01</span>
        </div>
        <div className="login-story-copy">
          <span className="eyebrow">
            <span className="status-dot" />
            FOR THE PEOPLE BEHIND THE PERSPECTIVE
          </span>
          <h1>
            Good stories.
            <br />
            Open minds.
            <br />
            <em>A shared desk.</em>
          </h1>
          <p>
            A considered space to shape the stories of Bangladesh’s waters. Your next chapter starts
            here.
          </p>
          <div className="login-story-rule">
            <Waves size={25} />
            <span>ROOTED IN BANGLADESH. CONNECTED BY WATER.</span>
          </div>
        </div>
        <div className="login-story-bottom">
          <span>{siteName}</span>
          <span>BEYOND THE WATER</span>
        </div>
        <div className="login-contours" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </section>
      <section className="login-form-panel">
        <Link className="back-link" to="/">
          <ArrowLeft size={17} />
          Back to the publication
        </Link>
        <div className="login-form-content">
          <span className="login-lock">
            <LockKeyhole size={25} strokeWidth={1.4} />
          </span>
          <span className="eyebrow">WELCOME TO THE EDITORIAL DESK</span>
          <h2>
            A little focus.
            <br />A fresh perspective.
          </h2>
          <p>Sign in with your editorial account to continue.</p>
          <form onSubmit={submit}>
            <label className="field">
              <span>EMAIL ADDRESS</span>
              <input
                autoComplete="username"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError('');
                }}
              />
            </label>
            <label className="field">
              <span>PASSWORD</span>
              <div className="password-field">
                <input
                  autoComplete="current-password"
                  type={visible ? 'text' : 'password'}
                  required
                  placeholder="Your workspace password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={visible ? 'Hide password' : 'Show password'}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="button button-primary login-submit">
              {busy ? <LoaderCircle className="spin" size={18} /> : 'Enter the workspace'}
              {!busy && <ArrowRight size={18} />}
            </button>
          </form>
          <p className="login-help">
            Need a place at the desk? Ask the workspace owner to create your account in{' '}
            <strong>Team & access</strong>.
          </p>
        </div>
        <div className="login-panel-footer">
          <span>{siteName}</span>
          <span>THOUGHTFULLY PUT TOGETHER.</span>
        </div>
      </section>
    </div>
  );
}
