'use client';

import { useEffect, useState } from 'react';

interface DigestEvent {
  id: number;
  title: string;
  short_title: string;
  venue_name: string;
  age_label: string;
  next_start_at: string;
  next_end_at: string;
  is_free: number;
  price_min: number;
  price_max: number;
  price_summary: string;
  image_url: string;
  rating_avg: number;
  curator_note: string;
}

interface DigestDetail {
  digest: {
    title: string;
    subtitle: string;
    cover_image: string;
    category_tag: string;
    curator_name: string;
    curator_role: string;
    context_tags: string;
  };
  events: DigestEvent[];
}

interface DigestPanelProps {
  slug: string;
  onClose: () => void;
  onEventClick: (event: DigestEvent) => void;
}

function formatDate(s: string) {
  if (!s) return '';
  try {
    return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

function priceStr(ev: DigestEvent) {
  if (ev.is_free) return 'FREE';
  if (ev.price_min > 0 && ev.price_max > ev.price_min) return `$${ev.price_min}–$${ev.price_max}`;
  if (ev.price_min > 0) return `$${ev.price_min}`;
  return '';
}

export default function DigestPanel({ slug, onClose, onEventClick }: DigestPanelProps) {
  const [data, setData] = useState<DigestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/digests/${slug}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  return (
    <div className="digest-panel-backdrop" onClick={onClose}>
      <div className="digest-panel" onClick={e => e.stopPropagation()}>
        <button className="digest-panel-close" onClick={onClose}>✕</button>

        {loading && <div className="digest-panel-loading">Loading…</div>}

        {data && !loading && (
          <>
            {/* Cover */}
            <div className="digest-panel-cover">
              {data.digest.cover_image && (
                <img src={data.digest.cover_image} alt={data.digest.title} />
              )}
              <div className="digest-panel-cover-grad" />
              <div className="digest-panel-cover-text">
                <span className="digest-panel-tag">{data.digest.category_tag}</span>
                <h2 className="digest-panel-title">{data.digest.title}</h2>
                <p className="digest-panel-sub">{data.digest.subtitle}</p>
              </div>
            </div>

            {/* Curator */}
            <div className="digest-panel-curator">
              <div className="digest-panel-curator-avatar">
                {data.digest.curator_name.charAt(0)}
              </div>
              <div>
                <div className="digest-panel-curator-name">by {data.digest.curator_name}</div>
                <div className="digest-panel-curator-role">{data.digest.curator_role}</div>
              </div>
            </div>

            {/* Events list */}
            <div className="digest-panel-events">
              {data.events.map((ev, i) => (
                <div
                  key={ev.id}
                  className="digest-panel-event"
                  onClick={() => onEventClick(ev)}
                >
                  <div className="digest-panel-event-img">
                    {ev.image_url ? (
                      <img src={ev.image_url} alt={ev.title} loading="lazy" />
                    ) : (
                      <div className="digest-panel-event-placeholder">{i + 1}</div>
                    )}
                  </div>
                  <div className="digest-panel-event-body">
                    <h4 className="digest-panel-event-title">
                      {ev.short_title || ev.title}
                    </h4>
                    {ev.curator_note && (
                      <p className="digest-panel-event-note">"{ev.curator_note}"</p>
                    )}
                    <div className="digest-panel-event-meta">
                      {ev.age_label && <span>{ev.age_label}</span>}
                      {ev.next_start_at && <span>{formatDate(ev.next_start_at)}</span>}
                      {ev.rating_avg > 0 && <span>★ {ev.rating_avg.toFixed(1)}</span>}
                      {priceStr(ev) && (
                        <span className={ev.is_free ? 'digest-free' : 'digest-price'}>
                          {priceStr(ev)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
