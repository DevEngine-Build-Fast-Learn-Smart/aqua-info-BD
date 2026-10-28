import { useState, type FormEvent } from 'react';
import { Calculator, FileText, Download, ArrowUpRight, Waves } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { Modal } from '../../components/ui/Modal';
import { SectionHeading } from './SectionHeading';
import type { Resource } from '../../data/types';
import { downloadText } from '../../lib/utils';

export function KnowledgeSection({ standalone = false }: { standalone?: boolean }) {
  const { data, t } = useSite();
  const [active, setActive] = useState<Resource | null>(null);
  const resources = data.resources.filter((resource) => resource.status === 'published');
  return (
    <section className="knowledge-section section-space">
      <div className="container">
        <SectionHeading
          eyebrow={t(
            'PRACTICAL KNOWLEDGE · মাঠ পর্যায়ের নির্দেশিকা',
            'ব্যবহারিক জ্ঞান · মাঠ পর্যায়ের নির্দেশিকা',
          )}
          title={t(
            'Aquaculture Knowledge Hub & Worksheets',
            'মৎস্য চাষের জ্ঞানভান্ডার ও কার্যপত্র',
          )}
          to={standalone ? undefined : '/knowledge-hub'}
          action={t('Explore all resources', 'সব উপকরণ')}
        />
        <div className="knowledge-grid">
          {resources.map((resource, index) => (
            <article
              className={`resource-card ${index === 0 ? 'resource-featured' : ''}`}
              key={resource.id}
            >
              <div className="resource-top">
                {resource.type === 'calculator' ? <Calculator size={20} /> : <FileText size={20} />}
                <span className="eyebrow">
                  {resource.type === 'calculator'
                    ? 'CALCULATOR TOOLKIT'
                    : resource.type === 'guide'
                      ? 'FIELD GUIDE'
                      : 'PRACTICAL WORKSHEET'}
                  <span className="resource-format">
                    {resource.type === 'guide' ? 'TXT' : 'INTERACTIVE'}
                  </span>
                </span>
              </div>
              <h3>{t(resource.title, resource.titleBn)}</h3>
              <p>{resource.description}</p>
              {index === 0 && (
                <div className="water-metrics">
                  <div>
                    <Waves size={18} />
                    <strong>{t('Measure', 'পরিমাপ')}</strong>
                    <span>{t('Length & width', 'দৈর্ঘ্য ও প্রস্থ')}</span>
                  </div>
                  <div>
                    <span className="metric-symbol">↧</span>
                    <strong>{t('Understand', 'বুঝুন')}</strong>
                    <span>{t('Average depth', 'গড় গভীরতা')}</span>
                  </div>
                  <div>
                    <span className="metric-symbol">m³</span>
                    <strong>{t('Plan', 'পরিকল্পনা')}</strong>
                    <span>{t('Water volume', 'পানির আয়তন')}</span>
                  </div>
                </div>
              )}
              <div className="resource-bottom">
                <span>{t('A practical starting point', 'ব্যবহারিক শুরুর উপকরণ')}</span>
                <button
                  className={index === 0 ? 'button button-primary button-small' : 'text-link'}
                  onClick={() => setActive(resource)}
                >
                  {resource.type === 'calculator'
                    ? t('Launch calculator', 'হিসাব করুন')
                    : resource.type === 'guide'
                      ? t('Open field guide', 'নির্দেশিকা খুলুন')
                      : t('Open worksheet', 'কার্যপত্র খুলুন')}
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {active && <ResourceDialog resource={active} onClose={() => setActive(null)} />}
      </div>
    </section>
  );
}
function ResourceDialog({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const { t } = useSite();
  const [result, setResult] = useState<number | null>(null);
  const [values, setValues] = useState({ length: '', width: '', depth: '', feed: '', gain: '' });
  const [completed, setCompleted] = useState<number[]>([]);
  const guideItems = [
    'Record the date, weather, and pond identification.',
    'Note water appearance and any visible changes.',
    'Record feeding amounts and observed feeding response.',
    'Log instrument readings, units, and measurement times.',
    'Record mortalities and unusual observations.',
    'Share concerns with a qualified local fisheries professional.',
  ];
  function calculate(event: FormEvent) {
    event.preventDefault();
    setResult(
      resource.type === 'calculator'
        ? Number(values.length) * Number(values.width) * Number(values.depth)
        : Number(values.feed) / Number(values.gain),
    );
  }
  return (
    <Modal title={t(resource.title, resource.titleBn)} onClose={onClose}>
      <p className="muted">{resource.description}</p>
      {resource.type === 'guide' ? (
        <>
          <div className="checklist">
            {guideItems.map((item, index) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={completed.includes(index)}
                  onChange={() =>
                    setCompleted((previous) =>
                      previous.includes(index)
                        ? previous.filter((v) => v !== index)
                        : [...previous, index],
                    )
                  }
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <button
            className="button button-primary"
            onClick={() =>
              downloadText(
                'aqua-info-bd-field-checklist.txt',
                `Aqua Info BD — Field Observation Checklist\n\n${guideItems.map((item, index) => `${completed.includes(index) ? '[x]' : '[ ]'} ${item}`).join('\n')}`,
              )
            }
          >
            <Download size={16} />
            {t('Download checklist', 'তালিকা ডাউনলোড')}
          </button>
        </>
      ) : (
        <form onSubmit={calculate} className="calculator-form">
          <div className="form-grid">
            {(resource.type === 'calculator'
              ? (['length', 'width', 'depth'] as const)
              : (['feed', 'gain'] as const)
            ).map((key) => (
              <label className="field" key={key}>
                <span>
                  {
                    {
                      length: t('Length (m)', 'দৈর্ঘ্য (মিটার)'),
                      width: t('Width (m)', 'প্রস্থ (মিটার)'),
                      depth: t('Average depth (m)', 'গড় গভীরতা (মিটার)'),
                      feed: t('Feed used (kg)', 'ব্যবহৃত খাদ্য (কেজি)'),
                      gain: t('Biomass gained (kg)', 'ওজন বৃদ্ধি (কেজি)'),
                    }[key]
                  }
                </span>
                <input
                  required
                  type="number"
                  min="0.001"
                  max="10000000"
                  step="any"
                  value={values[key]}
                  onChange={(event) => {
                    setResult(null);
                    setValues({ ...values, [key]: event.target.value });
                  }}
                  placeholder="0.00"
                />
              </label>
            ))}
          </div>
          <button className="button button-primary" type="submit">
            <Calculator size={16} />
            {t('Calculate', 'হিসাব করুন')}
          </button>
          {result !== null && (
            <div className="calculator-result" role="status">
              <span className="eyebrow">
                {resource.type === 'calculator'
                  ? t('ESTIMATED VOLUME', 'আনুমানিক আয়তন')
                  : 'FEED CONVERSION RATIO'}
              </span>
              <strong>
                {result.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                <small>{resource.type === 'calculator' ? ' m³' : ' FCR'}</small>
              </strong>
              <span>
                {resource.type === 'calculator'
                  ? `${(result * 1000).toLocaleString()} ${t('litres · rectangular pond estimate', 'লিটার · আয়তাকার পুকুরের হিসাব')}`
                  : t('Feed used ÷ biomass gained', 'ব্যবহৃত খাদ্য ÷ ওজন বৃদ্ধি')}
              </span>
            </div>
          )}
          <p className="caption">
            {t(
              'A planning worksheet. Results depend on the measurements you enter.',
              'পরিকল্পনার কার্যপত্র। ফলাফল আপনার দেওয়া পরিমাপের ওপর নির্ভর করে।',
            )}
          </p>
        </form>
      )}
    </Modal>
  );
}
