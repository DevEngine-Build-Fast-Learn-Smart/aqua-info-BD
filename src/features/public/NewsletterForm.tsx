import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const { t } = useSite();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (email.trim()) setSubmitted(true);
  }
  if (submitted)
    return (
      <div className={`newsletter-success ${dark ? 'on-dark' : ''}`} role="status">
        <CheckCircle2 size={26} />
        <div>
          <strong>{t('You’re on the preview list.', 'প্রিভিউ তালিকায় যুক্ত হয়েছেন।')}</strong>
          <p>
            {t(
              'Demo only — no email has been sent or registered with a service.',
              'এটি ডেমো — কোনো ইমেইল পাঠানো বা সার্ভিসে নিবন্ধন করা হয়নি।',
            )}
          </p>
          <button
            className="text-link"
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
          >
            {t('Use another email', 'অন্য ইমেইল ব্যবহার করুন')}
          </button>
        </div>
      </div>
    );
  return (
    <form className={`newsletter-form ${dark ? 'on-dark' : ''}`} onSubmit={submit}>
      <label className="sr-only" htmlFor={dark ? 'footer-email' : 'dispatch-email'}>
        {t('Email address', 'ইমেইল ঠিকানা')}
      </label>
      <div className="newsletter-input">
        <input
          id={dark ? 'footer-email' : 'dispatch-email'}
          required
          type="email"
          placeholder={t('Enter your email address', 'আপনার ইমেইল ঠিকানা')}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit" className="button button-teal">
          {t('Get the Dispatch', 'বার্তা পেতে চাই')}
          <ArrowRight size={16} />
        </button>
      </div>
      <small>
        {t(
          'A considered read, every Friday. UI preview — no emails are sent.',
          'প্রতি শুক্রবারের পাঠ। UI প্রিভিউ — কোনো ইমেইল পাঠানো হয় না।',
        )}
      </small>
    </form>
  );
}
