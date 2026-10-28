import { useState, type FormEvent } from 'react';
import { Save, Waves } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { AdminPageHeader } from './AdminPageHeader';
export default function MarketEditorPage() {
  const { data, update, notify } = useSite();
  const [rates, setRates] = useState(() => data.market.map((rate) => ({ ...rate })));
  function save(event: FormEvent) {
    event.preventDefault();
    update((previous) => ({ ...previous, market: rates }));
    notify('Market benchmark saved. The public strip and market page are updated.');
  }
  return (
    <form onSubmit={save}>
      <AdminPageHeader
        eyebrow="05 / AQUA MARKET BENCHMARK"
        title="Bring clarity to the numbers."
        description="Manage the sample farm-gate prices displayed across the publication."
      >
        <button className="button button-primary" type="submit">
          <Save size={16} />
          Save benchmark
        </button>
      </AdminPageHeader>
      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <Waves size={19} />
            <h2>Farm-gate benchmark</h2>
          </div>
          <span className="status-badge draft">Sample data</span>
        </div>
        <div className="table-scroll">
          <table className="data-table market-editor-table">
            <thead>
              <tr>
                <th>SPECIES</th>
                <th lang="bn">বাংলা নাম</th>
                <th>PRICE (৳ / KG)</th>
                <th>CHANGE (%)</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.id}>
                  <td>
                    <input
                      required
                      aria-label={`${rate.species} name`}
                      value={rate.species}
                      onChange={(e) =>
                        setRates((previous) =>
                          previous.map((r) =>
                            r.id === rate.id ? { ...r, species: e.target.value } : r,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      lang="bn"
                      aria-label={`${rate.species} Bangla name`}
                      value={rate.speciesBn}
                      onChange={(e) =>
                        setRates((previous) =>
                          previous.map((r) =>
                            r.id === rate.id ? { ...r, speciesBn: e.target.value } : r,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      required
                      aria-label={`${rate.species} price`}
                      type="number"
                      min="0"
                      max="1000000"
                      step="0.01"
                      value={rate.price}
                      onChange={(e) =>
                        setRates((previous) =>
                          previous.map((r) =>
                            r.id === rate.id ? { ...r, price: Number(e.target.value) } : r,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      required
                      aria-label={`${rate.species} change`}
                      type="number"
                      min="-100"
                      max="1000"
                      step="0.1"
                      value={rate.change}
                      onChange={(e) =>
                        setRates((previous) =>
                          previous.map((r) =>
                            r.id === rate.id ? { ...r, change: Number(e.target.value) } : r,
                          ),
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-footnote">
          A positive change shows an upward arrow. Negative values show a downward arrow. These
          examples are clearly labelled as sample prices on the public site.
        </div>
      </section>
    </form>
  );
}
