import { NextRequest } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export const dynamic = 'force-dynamic';

const DB_PATH = path.join(process.cwd(), 'data', 'events.db');

export async function GET(_req: NextRequest) {
  try {
    const db = new Database(DB_PATH, { readonly: true });

    const digests = db.prepare(`
      SELECT d.*,
        COUNT(de.id) as event_count
      FROM digests d
      LEFT JOIN digest_events de ON de.digest_id = d.id
      WHERE d.is_active = 1
        AND (d.expires_at IS NULL OR d.expires_at >= date('now'))
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `).all();

    db.close();
    return Response.json({ digests });
  } catch (err) {
    console.error('Digests API error:', err);
    return Response.json({ error: 'Failed to fetch digests' }, { status: 500 });
  }
}
