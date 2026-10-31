import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, Headphones, Menu, Search, X } from 'lucide-react';
import { Brand } from './Brand';
import { useSite } from '../../app/SiteProvider';
import { contentSections, aboutLinks } from '../../data/catalog';
import { SearchDialog } from '../../features/public/SearchDialog';
import { WeatherWidget } from '../ui/WeatherWidget';
import { HeaderTime } from '../ui/HeaderTime';
export function PublicHeader() {
  const { language, setLanguage, t, siteName } = useSite();
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false),
    [menuOpen, setMenuOpen] = useState(false);
  const navigation = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const close = () =>
    navigation.current
      ?.querySelectorAll('details[open]')
      .forEach((element) => element.removeAttribute('open'));
  const closeNavigation = () => {
    close();
    setMenuOpen(false);
  };
  useEffect(() => {
    setMenuOpen(false);
    close();
  }, [pathname]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const opened = navigation.current?.querySelector(
          'details[open] summary',
        ) as HTMLElement | null;
        close();
        if (window.matchMedia('(max-width: 1023px)').matches) menuButton.current?.focus();
        else opened?.focus();
        setMenuOpen(false);
      }
    };
    const outside = (event: MouseEvent) => {
      if (
        !navigation.current?.contains(event.target as Node) &&
        !menuButton.current?.contains(event.target as Node)
      ) {
        close();
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', escape);
    document.addEventListener('click', outside);
    return () => {
      document.removeEventListener('keydown', escape);
      document.removeEventListener('click', outside);
    };
  }, []);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, []);
  const date = new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
  }).format(new Date());
  return (
    <>
      <header className="public-header client-header">
        <div className="utility-bar">
          <div className="container utility-inner">
            <span className="header-dateline">
              <span className="tiny-square" />
              {date}
              <i />
              {t('Bangladesh & beyond', 'বাংলাদেশ ও বিশ্ব')}
            </span>
            <div className="utility-actions">
              <HeaderTime />
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
            <span className="eyebrow">AQUACULTURE · FISHERIES · KNOWLEDGE</span>
            <span>
              {t('Knowledge for', 'জলজ জগতের')}
              <br />
              <em>{t('our changing waters.', 'নতুন জ্ঞান।')}</em>
            </span>
          </Link>
          <div className="masthead-tools">
            <WeatherWidget />
            <button className="masthead-search" onClick={() => setSearchOpen(true)}>
              <Search size={21} />
              <span>
                {t('Search ', 'খুঁজুন: ')}
                {siteName}
              </span>
              <kbd className="search-keyboard-shortcut">⌘ K</kbd>
            </button>
            <div className="masthead-actions">
              <Link className="button button-primary header-podcast" to="/podcast">
                <Headphones size={19} />
                {t('Listen & learn', 'শুনুন ও জানুন')}
                <ArrowUpRight size={16} />
              </Link>
              <button
                className="icon-button mobile-search"
                aria-label="Search website"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={22} />
              </button>
              <button
                ref={menuButton}
                className="icon-button mobile-menu"
                aria-label="Toggle navigation"
                aria-expanded={menuOpen}
                aria-controls="client-navigation"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        <nav
          ref={navigation}
          id="client-navigation"
          className={`client-navigation ${menuOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
        >
          <div className="container client-nav-inner">
            <NavLink to="/" end className="client-home" onClick={closeNavigation}>
              {t('Home', 'হোম')}
            </NavLink>
            {contentSections.map((section) => (
              <details
                className={`client-menu ${pathname.startsWith('/' + section.id) ? 'current' : ''}`}
                key={section.id}
                onToggle={(event) => {
                  if (event.currentTarget.open)
                    navigation.current?.querySelectorAll('details').forEach((detail) => {
                      if (detail !== event.currentTarget) detail.open = false;
                    });
                }}
              >
                <summary>
                  {t(section.name, section.nameBn)}
                  <ChevronDown size={13} />
                </summary>
                <div className="client-submenu">
                  <Link className="client-menu-all" to={`/${section.id}`} onClick={closeNavigation}>
                    {t('Explore ', 'সব দেখুন: ')}
                    {t(section.name, section.nameBn)}
                    <ArrowUpRight size={15} />
                  </Link>
                  {section.topics.map((topic) => (
                    <Link to={topic.path} key={topic.slug} onClick={closeNavigation}>
                      {t(topic.name, topic.nameBn)}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <details
              className={`client-menu ${pathname.startsWith('/about') ? 'current' : ''}`}
              onToggle={(event) => {
                if (event.currentTarget.open)
                  navigation.current?.querySelectorAll('details').forEach((detail) => {
                    if (detail !== event.currentTarget) detail.open = false;
                  });
              }}
            >
              <summary>
                {t('About Us', 'আমাদের সম্পর্কে')}
                <ChevronDown size={13} />
              </summary>
              <div className="client-submenu">
                {aboutLinks.map((item) => (
                  <Link to={item.path} key={item.path} onClick={closeNavigation}>
                    {item.path === '/about'
                      ? t('About ', 'পরিচিতি: ') + siteName
                      : t(item.name, item.nameBn)}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </nav>
      </header>
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </>
  );
}
