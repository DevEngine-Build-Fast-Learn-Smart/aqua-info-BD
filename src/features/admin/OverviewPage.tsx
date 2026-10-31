import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  FileCheck2,
  FilePenLine,
  Plus,
  UsersRound,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../app/SiteProvider';
import { useAccess } from './access/AccessProvider';
import { contentSections, sectionById } from '../../data/catalog';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { entryPath } from '../../data/catalog';
import { today } from '../../lib/utils';
export default function OverviewPage() {
  const { data, siteName } = useSite();
  const { currentUser, can, members } = useAccess();
  const overview = data.overview;
  const areas = contentSections.filter((section) => can(section.id));
  const stats = [
    {
      label: 'Live on the website',
      value: overview?.live ?? 0,
      note: 'Published and available to readers',
      icon: FileCheck2,
      className: 'live',
    },
    {
      label: 'Drafts to review',
      value: overview?.drafts ?? data.counts.drafts,
      note: 'Saved privately, ready for your attention',
      icon: FilePenLine,
      className: 'draft',
    },
    {
      label: 'Scheduled content',
      value: overview?.scheduled ?? 0,
      note: 'Goes live on its publish date',
      icon: Clock3,
      className: 'scheduled',
    },
    {
      label: 'Upcoming events',
      value: overview?.upcomingEvents ?? 0,
      note: `${overview?.openCareers ?? 0} open career opportunities`,
      icon: CalendarDays,
      className: 'events',
    },
  ];
  const date = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Dhaka',
  }).format(new Date());
  const recent = overview?.recentEntries || [],
    drafts = overview?.pendingDrafts || [];
  const max = Math.max(1, ...(overview?.sections || []).map((section) => section.total));
  return (
    <div className="dashboard-overview">
      <header className="dashboard-welcome">
        <div>
          <span className="eyebrow">{siteName} / EDITORIAL OVERVIEW</span>
          <h1>Welcome back, {currentUser?.name.split(' ')[0] || 'editor'}.</h1>
          <p>
            {date}
            <span>·</span>
            {currentUser?.role === 'owner'
              ? 'Across your entire publication'
              : 'Your assigned content sections'}
          </p>
        </div>
        <Link to="/admin/profile" className="dashboard-account">
          <Avatar user={currentUser} />
          <div>
            <strong>{currentUser?.name}</strong>
            <span>{currentUser?.role}</span>
          </div>
          <ArrowUpRight size={16} />
        </Link>
      </header>
      <div className="dashboard-stat-grid">
        {stats.map((stat) => (
          <article className={`dashboard-stat stat-${stat.className}`} key={stat.label}>
            <div>
              <span>{stat.label}</span>
              <stat.icon size={20} />
            </div>
            <strong>{stat.value.toLocaleString()}</strong>
            <p>{stat.note}</p>
          </article>
        ))}
      </div>
      {areas.length > 0 && (
        <section className="dashboard-quick-actions" aria-label="Quick actions">
          <span className="eyebrow">START HERE</span>
          {areas.slice(0, 4).map((section) => (
            <Link to={`/admin/${section.id}/new`} key={section.id}>
              <Plus size={17} />
              {section.id === 'podcast'
                ? 'Add an episode'
                : section.id === 'events'
                  ? 'Create an event'
                  : 'Create ' + section.name.toLowerCase()}
            </Link>
          ))}
          {can('homepage') && (
            <Link to="/admin/homepage">
              Manage homepage
              <ArrowRight size={17} />
            </Link>
          )}
        </section>
      )}
      <div className="dashboard-main-grid">
        <section className="admin-panel dashboard-content-health">
          <div className="panel-heading">
            <div>
              <h2>Content by section</h2>
              <p className="caption">Live content, work in progress and scheduled releases</p>
            </div>
            <span className="dashboard-total">{data.counts.entries} total</span>
          </div>
          <div className="dashboard-health-legend">
            <span>
              <i className="health-live" />
              Live
            </span>
            <span>
              <i className="health-draft" />
              Draft
            </span>
            <span>
              <i className="health-scheduled" />
              Scheduled
            </span>
          </div>
          {areas.length ? (
            <div className="dashboard-section-rows">
              {areas.map((section) => {
                const value = overview?.sections.find((item) => item.section === section.id);
                const live = value?.live || 0,
                  draft = value?.drafts || 0,
                  scheduled = value?.scheduled || 0;
                return (
                  <Link to={'/admin/' + section.id} key={section.id}>
                    <div>
                      <strong>{section.name}</strong>
                      <span>
                        {value?.total || 0}
                        <ArrowUpRight size={15} />
                      </span>
                    </div>
                    <div className="dashboard-health-track">
                      <span className="health-live" style={{ width: `${(live / max) * 100}%` }} />
                      <span className="health-draft" style={{ width: `${(draft / max) * 100}%` }} />
                      <span
                        className="health-scheduled"
                        style={{ width: `${(scheduled / max) * 100}%` }}
                      />
                    </div>
                    <p>
                      {live} live<span>·</span>
                      {draft} draft<span>·</span>
                      {scheduled} scheduled
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Overview access only"
              description="No publishing sections have been assigned to this account. Your superadmin can update your role and access."
            />
          )}
        </section>
        <section className="admin-panel dashboard-draft-panel">
          <div className="panel-heading">
            <div>
              <h2>Ready for your attention</h2>
              <span className="caption">Your latest drafts</span>
            </div>
            <FilePenLine size={22} />
          </div>
          {drafts.length ? (
            <div className="dashboard-draft-list">
              {drafts.map((entry) => (
                <Link key={entry.id} to={`/admin/${entry.section}/${entry.id}`}>
                  <span className="eyebrow">{sectionById(entry.section)?.name}</span>
                  <h3>{entry.title}</h3>
                  <span>
                    Continue editing
                    <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="Your editing desk is clear."
              description="There are no drafts awaiting attention in your assigned sections."
            />
          )}
        </section>
      </div>
      <section className="admin-panel dashboard-recent">
        <div className="panel-heading">
          <h2>Recently updated</h2>
          <span className="caption">Latest content changes in your workspace</span>
        </div>
        {recent.length ? (
          <div className="dashboard-recent-list">
            {recent.map((entry) => (
              <article key={entry.id}>
                <div>
                  <span className="eyebrow">{sectionById(entry.section)?.name}</span>
                  <h3>
                    <Link to={`/admin/${entry.section}/${entry.id}`}>{entry.title}</Link>
                  </h3>
                  <span className="caption">
                    {entry.updatedAt
                      ? new Intl.DateTimeFormat('en-GB', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                          timeZone: 'Asia/Dhaka',
                        }).format(new Date(entry.updatedAt))
                      : entry.date}
                  </span>
                </div>
                <span
                  className={`dashboard-content-status ${entry.status === 'draft' ? 'draft' : entry.date > today() ? 'scheduled' : 'live'}`}
                >
                  {entry.status === 'draft' ? 'Draft' : entry.date > today() ? 'Scheduled' : 'Live'}
                </span>
                <Link
                  className="icon-button"
                  aria-label={'Edit ' + entry.title}
                  to={`/admin/${entry.section}/${entry.id}`}
                >
                  <ArrowUpRight size={18} />
                </Link>
                {entry.status === 'published' && entry.date <= today() && (
                  <Link
                    className="text-link dashboard-public-link"
                    target="_blank"
                    to={entryPath(entry)}
                  >
                    View
                    <ArrowUpRight size={15} />
                  </Link>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your publication starts here."
            description="Create your first content item and it will appear in your recent activity."
          />
        )}
      </section>
      {can('team') && (
        <Link to="/admin/team" className="dashboard-team-summary">
          <span>
            <UsersRound size={22} />
            <strong>
              {members.filter((member) => member.status === 'active').length} active team accounts
            </strong>
          </span>
          <span>
            {members.filter((member) => member.status !== 'active').length} suspended
            <ArrowUpRight size={18} />
          </span>
        </Link>
      )}
    </div>
  );
}
