import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen, FileText, Plus, Video } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { AdminPageHeader } from './AdminPageHeader';
import { assetUrl, formatDate, today } from '../../lib/utils';
import { useAccess } from './access/AccessProvider';
export default function OverviewPage() {
  const { data } = useSite();
  const { can } = useAccess();
  const lead =
    data.articles.find((a) => a.id === data.settings.leadArticleId && a.status === 'published') ||
    data.articles.find((a) => a.status === 'published');
  const published = data.articles.filter((a) => a.status === 'published');
  const drafts = data.articles.filter((a) => a.status === 'draft');
  const metrics = [
    {
      label: 'PUBLISHED STORIES',
      value: data.counts?.published ?? published.length,
      icon: FileText,
      note: 'Perspectives out in the world',
      to: '/admin/articles?status=published',
    },
    {
      label: 'ON THE EDITING DESK',
      value: data.counts?.drafts ?? drafts.length,
      icon: BookOpen,
      note: 'Drafts ready for your attention',
      to: '/admin/articles?status=draft',
    },
    {
      label: 'VISUAL FIELD REPORTS',
      value: data.counts?.videos ?? data.videos.filter((v) => v.status === 'published').length,
      icon: Video,
      note: 'Stories with a different lens',
      to: '/admin/videos',
    },
  ];
  return (
    <>
      <AdminPageHeader
        eyebrow={`${formatDate(today()).toUpperCase()} / YOUR PUBLICATION AT A GLANCE`}
        title="A good day for a new perspective."
        description="Shape the journal. Follow the stories. Keep the water in view."
      >
        {can('articles') && (
          <Link className="button button-primary" to="/admin/articles/new">
            <Plus size={17} />
            Create a story
          </Link>
        )}
      </AdminPageHeader>
      <div className="admin-metrics">
        {metrics.map((metric, index) => (
          <Link
            key={metric.label}
            to={
              can(metric.to.startsWith('/admin/videos') ? 'videos' : 'articles')
                ? metric.to
                : '/admin/'
            }
            className="admin-metric"
          >
            <div>
              <span className="eyebrow">{metric.label}</span>
              <metric.icon size={19} strokeWidth={1.5} />
            </div>
            <strong>
              {String(metric.value).padStart(2, '0')}
              <span>0{index + 1}</span>
            </strong>
            <p>
              {metric.note}
              <ArrowUpRight size={16} />
            </p>
          </Link>
        ))}
      </div>
      <div className="overview-editorial">
        <section className="admin-panel lead-preview-panel">
          <div className="panel-heading">
            <div>
              <span className="tiny-square" />
              <h2>On the front page</h2>
            </div>
            {can('homepage') && (
              <Link className="text-link" to="/admin/homepage">
                Manage homepage
                <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
          {lead ? (
            <div className="admin-lead-preview">
              <div className="admin-lead-image">
                <img src={assetUrl(lead.image)} alt={lead.imageAlt} />
                <span>THE LEAD STORY</span>
              </div>
              <div>
                <span className="eyebrow">
                  {data.categories.find((c) => c.id === lead.category)?.name}
                </span>
                <h3>{lead.title}</h3>
                <p>{lead.excerpt}</p>
                <div className="admin-preview-bottom">
                  <span>{lead.author}</span>
                  {can('articles') && (
                    <Link to={`/admin/articles/${lead.id}`} className="text-link">
                      Edit story
                      <ArrowUpRight size={15} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="panel-padding muted">Publish a story to give your front page a lead.</p>
          )}
        </section>
        <section className="edition-note">
          <span className="eyebrow">A NOTE FROM THE DESK</span>
          <span className="edition-number">
            01<span>/ IN THE MAKING</span>
          </span>
          <h2>
            A publication is built
            <br />
            one good story at a time.
          </h2>
          <p>
            Your public site and editorial desk share one content library. Every saved edit helps
            you see the full picture.
          </p>
          <div>
            <span className="status-dot" />
            Connected publication · Server storage
          </div>
          <Link to="/home" target="_blank" rel="noreferrer">
            Explore the public view
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </div>
      <div className="overview-bottom">
        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <span className="tiny-square" />
              <h2>From the editing desk</h2>
            </div>
            {can('articles') && (
              <Link to="/admin/articles" className="text-link">
                All stories
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
          <div className="table-scroll">
            <table className="data-table editorial-table">
              <thead>
                <tr>
                  <th>STORY</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th>
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...data.articles]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 5)
                  .map((article) => (
                    <tr key={article.id}>
                      <td>
                        <Link
                          to={
                            can('articles')
                              ? `/admin/articles/${article.id}`
                              : article.status === 'published'
                                ? `/articles/${article.slug}`
                                : '/admin/'
                          }
                        >
                          <strong>{article.title}</strong>
                          <small>
                            {data.categories.find((c) => c.id === article.category)?.name}
                          </small>
                        </Link>
                      </td>
                      <td>
                        <span className={`status-badge ${article.status}`}>{article.status}</span>
                      </td>
                      <td className="date-cell">{formatDate(article.date)}</td>
                      <td>
                        {can('articles') && (
                          <Link
                            className="icon-button"
                            to={`/admin/articles/${article.id}`}
                            aria-label={`Edit ${article.title}`}
                          >
                            <ArrowUpRight size={17} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="admin-panel homepage-map">
          <div className="panel-heading">
            <h2>The homepage, in order</h2>
          </div>
          <div>
            {data.sections.map((section, index) => (
              <Link key={section.id} to={can('homepage') ? '/admin/homepage' : '/admin/'}>
                <span>0{index + 1}</span>
                <strong>{section.name}</strong>
                <i className={section.enabled ? 'enabled-dot' : 'disabled-dot'} />
              </Link>
            ))}
          </div>
          {can('homepage') && (
            <Link className="text-link map-action" to="/admin/homepage">
              Arrange your publication
              <ArrowRight size={15} />
            </Link>
          )}
        </section>
      </div>
    </>
  );
}
