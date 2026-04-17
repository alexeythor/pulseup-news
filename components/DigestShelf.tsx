'use client';

import { useEffect, useState } from 'react';
import DigestCard from './DigestCard';
import DigestPanel from './DigestPanel';

interface Digest {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  cover_image: string;
  category_tag: string;
  curator_name: string;
  curator_role: string;
  event_count: number;
  context_tags: string;
}

const QUICK_TAGS = [
  { label: '🌸 Spring in NYC',     tag: 'spring' },
  { label: '👧 Weekend with daughter', tag: 'girls' },
  { label: '🎆 Independence Day',  tag: 'independence day' },
  { label: '🎨 Arts & Culture',    tag: 'arts' },
  { label: '🌿 Outdoor',           tag: 'outdoor' },
];

interface DigestShelfProps {
  onEventClick: (event: unknown) => void;
}

export default function DigestShelf({ onEventClick }: DigestShelfProps) {
  const [digests, setDigests] = useState<Digest[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/digests')
      .then(r => r.json())
      .then(d => setDigests(d.digests || []))
      .catch(console.error);
  }, []);

  const filtered = activeTag
    ? digests.filter(d => {
        const tags: string[] = JSON.parse(d.context_tags || '[]');
        return tags.some(t => t.toLowerCase().includes(activeTag));
      })
    : digests;

  if (digests.length === 0) return null;

  return (
    <>
      <div className="digest-shelf">
        {/* Header */}
        <div className="digest-shelf-header">
          <div>
            <h2 className="digest-shelf-title">Mom's Digest</h2>
            <p className="digest-shelf-sub">Curated collections for your lifestyle.</p>
          </div>
          <button className="digest-shelf-viewall">View All →</button>
        </div>

        {/* Quick tag pills */}
        <div className="digest-shelf-tags">
          {QUICK_TAGS.map(qt => (
            <button
              key={qt.tag}
              className={`digest-tag-pill ${activeTag === qt.tag ? 'active' : ''}`}
              onClick={() => setActiveTag(activeTag === qt.tag ? null : qt.tag)}
            >
              {qt.label}
            </button>
          ))}
        </div>

        {/* Cards row */}
        <div className="digest-shelf-row">
          {filtered.map(d => (
            <DigestCard
              key={d.slug}
              digest={d}
              onClick={setOpenSlug}
            />
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {openSlug && (
        <DigestPanel
          slug={openSlug}
          onClose={() => setOpenSlug(null)}
          onEventClick={(ev) => {
            setOpenSlug(null);
            onEventClick(ev);
          }}
        />
      )}
    </>
  );
}
