import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  ChevronDown,
  Menu,
  Search,
  Waves,
  X,
} from 'lucide-react';
import { Brand } from './Brand';
import { useSite } from '../../app/SiteProvider';
import { SearchDialog } from '../../features/public/SearchDialog';

export function PublicHeader() {
  const { data, language, setLanguage, t } = useSite();
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);
  useEffect(() => {
    const dismiss = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('click', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  const nav = [
    { to: '/home', label: t('Home', 'হোম') },
    { to: '/news', label: t('News', 'সংবাদ') },
    ...data.categories
      .slice(0, 3)
      .map((category) => ({ to: `/${category.id}`, label: t(category.name, category.nameBn) })),
    { to: '/knowledge-hub', label: t('Knowledge Hub', 'জ্ঞানভান্ডার') },
    ...data.categories
      .slice(3)
      .map((category) => ({ to: `/${category.id}`, label: t(category.name, category.nameBn) })),
  ];
  const date = new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Dhaka',
  }).format(new Date());
  return (
    <>
      <header className="public-header">
        <div className="utility-bar">
          <div className="container utility-inner">
            <span className="header-dateline">
              <span className="tiny-square" />
              {date}
              <i />
              <span>{t('Bangladesh, in perspective', 'বাংলাদেশের জলজ জগতের দৃষ্টিভঙ্গি')}</span>
            </span>
            <div className="utility-right">
              <span className="edition">
                {t(
                  'Independent by nature. Connected by water.',
                  'স্বাধীন দৃষ্টিভঙ্গি। জলের সংযোগে।',
                )}
              </span>
              <div className="language-switch" aria-label="Language">
                <button
                  aria-pressed={language === 'en'}
                  className={language === 'en' ? 'active' : ''}
                  onClick={() => setLanguage('en')}
                >
                  EN
                </button>
                <button
                  lang="bn"
                  aria-pressed={language === 'bn'}
                  className={language === 'bn' ? 'active' : ''}
                  onClick={() => setLanguage('bn')}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container masthead">
          <Brand />
          <Link className="journal-signature" to="/about">
            <span className="eyebrow">THE AQUATIC JOURNAL</span>
            <span>
              {t('A wider view of', 'জলজ জগতের')}
              <br />
              <em>{t('our changing waters.', 'নতুন দৃষ্টিভঙ্গি।')}</em>
            </span>
          </Link>
          <div className="masthead-tools">
            <button className="masthead-search" onClick={() => setSearchOpen(true)}>
              <Search size={21} />
              <span>
                {t('Find a story, discover a perspective', 'গল্প খুঁজুন, নতুন দৃষ্টিভঙ্গি জানুন')}
              </span>
              <span className="search-shortcut">↗</span>
            </button>
            <div className="masthead-actions">
              <Link className="button button-primary subscribe-link" to="/subscription">
                <BookOpen size={19} />
                {t('The Friday Dispatch', 'শুক্রবারের বার্তা')}
                <ArrowUpRight size={17} />
              </Link>
              <Link
                className="icon-button saved-link"
                to="/saved"
                aria-label={t('Saved stories', 'সংরক্ষিত প্রতিবেদন')}
              >
                <Bookmark size={22} />
              </Link>
              <button
                className="icon-button mobile-search"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search size={23} />
              </button>
              <button
                className="icon-button mobile-menu"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-controls="publication-navigation"
                aria-label="Toggle navigation"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        <div
          id="publication-navigation"
          className={`navigation-wrap ${menuOpen ? 'menu-open' : ''}`}
        >
          <nav className="container main-navigation" aria-label="Main navigation">
            <div className="nav-links">
              {nav.map((item, index) => (
                <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
                  <span className="nav-folio" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="more-nav" ref={moreRef}>
              <button onClick={() => setMoreOpen(!moreOpen)} aria-expanded={moreOpen}>
                <Waves size={17} />
                {t('Explore', 'আরও জানুন')}
                <ChevronDown size={15} />
              </button>
              {moreOpen && (
                <div className="dropdown">
                  <span className="eyebrow">{t('BEYOND THE FRONT PAGE', 'প্রথম পাতার বাইরে')}</span>
                  <Link to="/videos" onClick={() => setMoreOpen(false)}>
                    {t('Visual field reports', 'ভিডিও প্রতিবেদন')}
                    <ArrowUpRight size={16} />
                  </Link>
                  <Link to="/market" onClick={() => setMoreOpen(false)}>
                    {t('Market benchmark', 'বাজারদর')}
                    <ArrowUpRight size={16} />
                  </Link>
                  <Link to="/about" onClick={() => setMoreOpen(false)}>
                    {t('About the journal', 'জার্নাল সম্পর্কে')}
                    <ArrowUpRight size={16} />
                  </Link>
                  <Link to="/admin/" onClick={() => setMoreOpen(false)}>
                    {t('The editorial desk', 'সম্পাদকীয় ডেস্ক')}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </>
  );
}
