import { useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Mail, Send } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';

export default function ContactPage() {
  const { data, t } = useSite();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({ name: '', email: '', message: '' });
  const service = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const template = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const configured = !!(service && template && publicKey);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!configured) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          service_id: service,
          template_id: template,
          user_id: publicKey,
          template_params: {
            from_name: fields.name,
            from_email: fields.email,
            reply_to: fields.email,
            message: fields.message,
          },
        }),
      });
      if (!response.ok)
        throw new Error('Your message could not be sent. Please try again or contact us by email.');
      setSent(true);
      setFields({ name: '', email: '', message: '' });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'The email service is unavailable. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="container simple-page contact-page">
      <span className="eyebrow">AQUA INFO BD / {t('GET IN TOUCH', 'যোগাযোগ')}</span>
      <h1>{t('A conversation starts here.', 'এখান থেকেই আলাপ শুরু।')}</h1>
      <p className="about-lead">
        {t(
          'Have a story idea, a research perspective, or a question? Write to the editorial team.',
          'প্রতিবেদনের ধারণা, গবেষণার দৃষ্টিভঙ্গি অথবা কোনো প্রশ্ন আছে? সম্পাদকীয় দলকে লিখুন।',
        )}
      </p>
      <div className="contact-grid">
        <aside>
          <Mail size={28} />
          <h2>{t('The editorial desk', 'সম্পাদকীয় ডেস্ক')}</h2>
          <a className="text-link" href={`mailto:${data.settings.email}`}>
            {data.settings.email}
            <ArrowUpRight size={17} />
          </a>
          <p>
            {t(
              'No reader account is needed to get in touch.',
              'যোগাযোগ করতে কোনো পাঠক অ্যাকাউন্ট প্রয়োজন নেই।',
            )}
          </p>
        </aside>
        {sent ? (
          <div className="contact-success" role="status">
            <CheckCircle2 size={34} />
            <h2>{t('Your message has been sent.', 'আপনার বার্তা পাঠানো হয়েছে।')}</h2>
            <p>
              {t('Thank you for writing to Aqua Info BD.', 'Aqua Info BD-কে লেখার জন্য ধন্যবাদ।')}
            </p>
            <button className="button button-outline" onClick={() => setSent(false)}>
              {t('Write another message', 'আরও একটি বার্তা লিখুন')}
            </button>
          </div>
        ) : !configured ? (
          <div className="info-note">
            <h3>{t('Email us directly.', 'সরাসরি ইমেইল করুন।')}</h3>
            <p>
              {t(
                'The contact form is being configured. You can reach the editorial team at the email address shown here.',
                'যোগাযোগ ফর্ম প্রস্তুত হচ্ছে। প্রদত্ত ইমেইল ঠিকানায় সম্পাদকীয় দলের সঙ্গে যোগাযোগ করতে পারেন।',
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label className="field">
              <span>{t('YOUR NAME', 'আপনার নাম')}</span>
              <input
                required
                maxLength={100}
                autoComplete="name"
                value={fields.name}
                onChange={(event) => setFields({ ...fields, name: event.target.value })}
              />
            </label>
            <label className="field">
              <span>{t('EMAIL ADDRESS', 'ইমেইল ঠিকানা')}</span>
              <input
                required
                type="email"
                maxLength={254}
                autoComplete="email"
                value={fields.email}
                onChange={(event) => setFields({ ...fields, email: event.target.value })}
              />
            </label>
            <label className="field">
              <span>{t('YOUR MESSAGE', 'আপনার বার্তা')}</span>
              <textarea
                required
                minLength={10}
                maxLength={5000}
                rows={7}
                value={fields.message}
                onChange={(event) => setFields({ ...fields, message: event.target.value })}
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button button-primary" type="submit" disabled={busy}>
              <Send size={17} />
              {busy ? t('Sending…', 'পাঠানো হচ্ছে…') : t('Send message', 'বার্তা পাঠান')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
