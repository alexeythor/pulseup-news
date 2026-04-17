import { NextRequest } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export const dynamic = 'force-dynamic';

const DB_PATH = path.join(process.cwd(), 'data', 'events.db');

const CATEGORY_ORDER = [
  'Make & Touch',
  'Mom & Daughter Day',
  'Near You',
  'Culture Weekend',
  'Spring in NYC',
  'Рестораны с детской',
];

export async function GET(_req: NextRequest) {
  try {
    const db = new Database(DB_PATH, { readonly: true });

    const rows = db.prepare(`
      SELECT d.*,
        COUNT(de.id) as event_count
      FROM digests d
      LEFT JOIN digest_events de ON de.digest_id = d.id
      WHERE d.is_active = 1
        AND (d.expires_at IS NULL OR d.expires_at >= date('now'))
      GROUP BY d.id
      ORDER BY d.id ASC
    `).all() as Array<Record<string, unknown> & { category: string }>;

    db.close();

    // Group by category in defined order
    const grouped: Record<string, typeof rows> = {};
    for (const d of rows) {
      const cat = d.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(d);
    }

    const categories = CATEGORY_ORDER
      .filter(c => grouped[c])
      .map(c => ({ name: c, digests: grouped[c] }));

    // Add any unknown categories at end
    for (const c of Object.keys(grouped)) {
      if (!CATEGORY_ORDER.includes(c)) {
        categories.push({ name: c, digests: grouped[c] });
      }
    }

    return Response.json({ digests: rows, categories });
  } catch (err) {
    console.error('Digests API error:', err);
    return Response.json({ error: 'Failed to fetch digests' }, { status: 500 });
  }
}
